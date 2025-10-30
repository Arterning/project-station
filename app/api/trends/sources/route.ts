import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkAdminByClerkId } from '@/lib/admin';

// GET /api/trends/sources - 获取所有订阅源
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sources = await prisma.trendSource.findMany({
      include: {
        _count: {
          select: { trends: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      sources: sources.map((source) => ({
        ...source,
        trendCount: source._count.trends,
      })),
    });
  } catch (error: any) {
    console.error('Failed to fetch sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/trends/sources - 创建新订阅源（仅管理员）
export async function POST(request: Request) {
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

    const body = await request.json();
    const { name, type, rssUrl, apiUrl, icon, description, isActive } = body;

    // 验证必填字段
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const source = await prisma.trendSource.create({
      data: {
        name,
        type,
        rssUrl,
        apiUrl,
        icon,
        description,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(source);
  } catch (error: any) {
    console.error('Failed to create source:', error);
    return NextResponse.json(
      { error: 'Failed to create source', details: error.message },
      { status: 500 }
    );
  }
}
