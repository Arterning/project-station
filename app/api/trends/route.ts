import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkAdminByClerkId } from '@/lib/admin';
import { fetchTrendData, calculateHotScore } from '@/lib/rss';

// GET /api/trends - 获取当前风向标数据
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取所有活跃的数据源及其风向标数据
    const sources = await prisma.trendSource.findMany({
      where: { isActive: true },
      include: {
        trends: {
          orderBy: { hotScore: 'desc' },
          take: 50, // 每个源最多50条
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      sources: sources.map((source) => ({
        id: source.id,
        name: source.name,
        type: source.type,
        refreshedAt: source.refreshedAt,
        trends: source.trends,
      })),
    });
  } catch (error: any) {
    console.error('Failed to fetch trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/trends - 刷新风向标数据（仅管理员）
export async function POST() {
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

    // 获取或创建 Hacker News 数据源
    let hackerNewsSource = await prisma.trendSource.findFirst({
      where: { type: 'HACKER_NEWS' },
    });

    if (!hackerNewsSource) {
      hackerNewsSource = await prisma.trendSource.create({
        data: {
          name: 'Hacker News',
          type: 'HACKER_NEWS',
          rssUrl: 'https://news.ycombinator.com/rss',
          apiUrl: 'https://hacker-news.firebaseio.com/v0',
          isActive: true,
        },
      });
    }

    // 删除旧数据（昨天的数据）
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    await prisma.trend.deleteMany({
      where: {
        sourceId: hackerNewsSource.id,
        createdAt: {
          lt: yesterday,
        },
      },
    });

    // 获取最新的 Top 50 数据
    const items = await fetchTrendData('HACKER_NEWS', 50);

    // 批量插入新数据
    const trends = items.map((item) => ({
      title: item.title,
      url: item.url,
      publishedAt: item.publishedAt,
      score: item.score,
      commentCount: item.commentCount,
      hotScore: calculateHotScore(item.score, item.commentCount),
      sourceId: hackerNewsSource.id,
    }));

    // 先删除今天的旧数据（避免重复）
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.trend.deleteMany({
      where: {
        sourceId: hackerNewsSource.id,
        createdAt: {
          gte: today,
        },
      },
    });

    // 插入新数据
    await prisma.trend.createMany({
      data: trends,
    });

    // 更新数据源的刷新时间
    await prisma.trendSource.update({
      where: { id: hackerNewsSource.id },
      data: { refreshedAt: new Date() },
    });

    // 返回更新后的数据
    const updatedSource = await prisma.trendSource.findUnique({
      where: { id: hackerNewsSource.id },
      include: {
        trends: {
          orderBy: { hotScore: 'desc' },
          take: 50,
        },
      },
    });

    return NextResponse.json({
      message: 'Trends refreshed successfully',
      source: updatedSource,
      count: trends.length,
    });
  } catch (error: any) {
    console.error('Failed to refresh trends:', error);
    return NextResponse.json(
      { error: 'Failed to refresh trends', details: error.message },
      { status: 500 }
    );
  }
}
