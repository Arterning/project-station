import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkAdminByClerkId } from '@/lib/admin';

// GET /api/trends/sources/[sourceId] - 获取单个订阅源详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceId } = await params;

    const source = await prisma.trendSource.findUnique({
      where: { id: sourceId },
      include: {
        trends: {
          orderBy: { hotScore: 'desc' },
          take: 50,
        },
      },
    });

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    return NextResponse.json(source);
  } catch (error: any) {
    console.error('Failed to fetch source:', error);
    return NextResponse.json(
      { error: 'Failed to fetch source', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/trends/sources/[sourceId] - 更新订阅源（仅管理员）
export async function PATCH(
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

    const body = await request.json();
    const { name, type, rssUrl, apiUrl, icon, description, isActive } = body;

    const { sourceId } = await params;


    const source = await prisma.trendSource.update({
      where: { id: sourceId },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(rssUrl !== undefined && { rssUrl }),
        ...(apiUrl !== undefined && { apiUrl }),
        ...(icon !== undefined && { icon }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(source);
  } catch (error: any) {
    console.error('Failed to update source:', error);
    return NextResponse.json(
      { error: 'Failed to update source', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/trends/sources/[sourceId] - 删除订阅源（仅管理员）
export async function DELETE(
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

    // 删除订阅源（级联删除相关的trends）
    await prisma.trendSource.delete({
      where: { id: sourceId },
    });

    return NextResponse.json({ message: 'Source deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete source:', error);
    return NextResponse.json(
      { error: 'Failed to delete source', details: error.message },
      { status: 500 }
    );
  }
}
