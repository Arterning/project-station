import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkAdminByClerkId } from '@/lib/admin';
import { fetchTrendData, calculateHotScore } from '@/lib/rss';

// POST /api/trends/sources/[sourceId]/refresh - 刷新指定订阅源数据（仅管理员）
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查管理员权限
    const isAdminUser = await checkAdminByClerkId(userId);
    if (!isAdminUser) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { sourceId } = await params;

    // 获取订阅源
    const source = await prisma.trendSource.findUnique({
      where: { id: sourceId },
    });

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    if (!source.isActive) {
      return NextResponse.json(
        { error: 'Source is not active' },
        { status: 400 }
      );
    }

    // 删除旧数据（昨天的数据）
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    await prisma.trend.deleteMany({
      where: {
        sourceId: source.id,
        createdAt: {
          lt: yesterday,
        },
      },
    });

    // 获取最新数据
    const items = await fetchTrendData(source.type, 50, source.rssUrl || undefined);

    // 批量插入新数据
    const trends = items.map((item) => ({
      title: item.title,
      url: item.url,
      publishedAt: item.publishedAt,
      score: item.score,
      commentCount: item.commentCount,
      hotScore: calculateHotScore(item.score, item.commentCount),
      sourceId: source.id,
    }));

    // 先删除今天的旧数据（避免重复）
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.trend.deleteMany({
      where: {
        sourceId: source.id,
        createdAt: {
          gte: today,
        },
      },
    });

    // 插入新数据
    if (trends.length > 0) {
      await prisma.trend.createMany({
        data: trends,
      });
    }

    // 更新数据源的刷新时间
    const updatedSource = await prisma.trendSource.update({
      where: { id: source.id },
      data: { refreshedAt: new Date() },
      include: {
        trends: {
          orderBy: { hotScore: 'desc' },
          take: 50,
        },
      },
    });

    return NextResponse.json({
      message: 'Source refreshed successfully',
      source: updatedSource,
      count: trends.length,
    });
  } catch (error: any) {
    console.error('Failed to refresh source:', error);
    return NextResponse.json(
      { error: 'Failed to refresh source', details: error.message },
      { status: 500 }
    );
  }
}
