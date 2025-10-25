import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateKeywordSchema } from '@/lib/validations/keyword'

// GET /api/keywords/[id] - 获取单个关键词
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const keyword = await prisma.keyword.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              }
            }
          }
        }
      }
    })

    if (!keyword) {
      return NextResponse.json({ error: '关键词不存在' }, { status: 404 })
    }

    return NextResponse.json(keyword)
  } catch (error) {
    console.error('获取关键词失败:', error)
    return NextResponse.json({ error: '获取关键词失败' }, { status: 500 })
  }
}

// PATCH /api/keywords/[id] - 更新关键词
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 检查关键词是否存在且属于当前用户
    const existingKeyword = await prisma.keyword.findFirst({
      where: {
        id,
        userId: user.id,
      }
    })

    if (!existingKeyword) {
      return NextResponse.json({ error: '关键词不存在' }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = updateKeywordSchema.parse(body)

    // 提取 projectIds
    const { projectIds, ...keywordData } = validatedData

    // 更新关键词
    const keyword = await prisma.keyword.update({
      where: { id },
      data: {
        ...keywordData,
        ...(projectIds !== undefined && {
          projects: {
            // 删除所有现有关联
            deleteMany: {},
            // 创建新关联
            create: projectIds.map(projectId => ({
              project: {
                connect: { id: projectId }
              }
            }))
          }
        })
      },
      include: {
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json(keyword)
  } catch (error: any) {
    console.error('更新关键词失败:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: '数据验证失败', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: '更新关键词失败' }, { status: 500 })
  }
}

// DELETE /api/keywords/[id] - 删除关键词
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 检查关键词是否存在且属于当前用户
    const existingKeyword = await prisma.keyword.findFirst({
      where: {
        id,
        userId: user.id,
      }
    })

    if (!existingKeyword) {
      return NextResponse.json({ error: '关键词不存在' }, { status: 404 })
    }

    await prisma.keyword.delete({
      where: { id }
    })

    return NextResponse.json({ message: '关键词已删除' })
  } catch (error) {
    console.error('删除关键词失败:', error)
    return NextResponse.json({ error: '删除关键词失败' }, { status: 500 })
  }
}
