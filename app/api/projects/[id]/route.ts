import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateProjectSchema } from '@/lib/validations/project'

// GET /api/projects/[id] - 获取单个项目详情
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        redditPosts: {
          orderBy: {
            score: 'desc'
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('获取项目详情失败:', error)
    return NextResponse.json({ error: '获取项目详情失败' }, { status: 500 })
  }
}

// PATCH /api/projects/[id] - 更新项目
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const validatedData = updateProjectSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 检查项目是否属于当前用户
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      }
    })

    return NextResponse.json(project)
  } catch (error: any) {
    console.error('更新项目失败:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: '数据验证失败', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: '更新项目失败' }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - 删除项目
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 检查项目是否属于当前用户
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    await prisma.project.delete({
      where: { id }
    })

    return NextResponse.json({ message: '项目已删除' })
  } catch (error) {
    console.error('删除项目失败:', error)
    return NextResponse.json({ error: '删除项目失败' }, { status: 500 })
  }
}
