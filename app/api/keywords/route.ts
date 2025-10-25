import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createKeywordSchema } from '@/lib/validations/keyword'

// GET /api/keywords - 获取用户所有关键词
export async function GET(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 获取查询参数
    const { searchParams } = new URL(req.url)
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

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const keywords = await prisma.keyword.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            projects: true
          }
        },
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

    // 转换数据格式，方便前端使用
    const formattedKeywords = keywords.map(keyword => ({
      id: keyword.id,
      name: keyword.name,
      popularity: keyword.popularity,
      description: keyword.description,
      longTails: keyword.longTails,
      createdAt: keyword.createdAt,
      updatedAt: keyword.updatedAt,
      projectCount: keyword._count.projects,
      projects: keyword.projects.map(pk => pk.project),
    }))

    return NextResponse.json(formattedKeywords)
  } catch (error) {
    console.error('获取关键词列表失败:', error)
    return NextResponse.json({ error: '获取关键词列表失败' }, { status: 500 })
  }
}

// POST /api/keywords - 创建新关键词
export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createKeywordSchema.parse(body)

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

    // 提取 projectIds
    const { projectIds, ...keywordData } = validatedData

    // 创建关键词并关联项目
    const keyword = await prisma.keyword.create({
      data: {
        ...keywordData,
        userId: user.id,
        projects: {
          create: projectIds.map(projectId => ({
            project: {
              connect: { id: projectId }
            }
          }))
        }
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

    return NextResponse.json(keyword, { status: 201 })
  } catch (error: any) {
    console.error('创建关键词失败:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: '数据验证失败', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: '创建关键词失败' }, { status: 500 })
  }
}
