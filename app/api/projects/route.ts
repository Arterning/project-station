import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProjectSchema } from '@/lib/validations/project'

// GET /api/projects - 获取用户所有项目
export async function GET(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 获取查询参数
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    // 确保用户存在
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      // 如果用户不存在，创建用户记录
      const clerkUser = await auth()
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.sessionClaims?.email as string || '',
          firstName: clerkUser.sessionClaims?.firstName as string || null,
          lastName: clerkUser.sessionClaims?.lastName as string || null,
          imageUrl: clerkUser.sessionClaims?.imageUrl as string || null,
        }
      })
    }

    // 构建查询条件
    const where: any = {
      userId: user.id,
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { idea: { contains: search, mode: 'insensitive' } },
      ]
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            redditPosts: true
          }
        }
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('获取项目列表失败:', error)
    return NextResponse.json({ error: '获取项目列表失败' }, { status: 500 })
  }
}

// POST /api/projects - 创建新项目
export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createProjectSchema.parse(body)

    // 确保用户存在
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      const clerkUser = await auth()
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.sessionClaims?.email as string || '',
          firstName: clerkUser.sessionClaims?.firstName as string || null,
          lastName: clerkUser.sessionClaims?.lastName as string || null,
          imageUrl: clerkUser.sessionClaims?.imageUrl as string || null,
        }
      })
    }

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        userId: user.id,
        validationKeywords: [],
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    console.error('创建项目失败:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: '数据验证失败', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: '创建项目失败' }, { status: 500 })
  }
}
