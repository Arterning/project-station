import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractKeywords } from '@/lib/openai'

// POST /api/projects/[id]/extract-keywords - 提取项目关键词
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params

    // 检查 OpenAI API Key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API 未配置，请联系管理员' },
        { status: 500 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 获取项目
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    // 使用 AI 提取关键词
    const keywords = await extractKeywords(
      project.name,
      project.idea,
      project.targetMarket || undefined
    )

    // 更新项目的验证关键词
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        validationKeywords: keywords
      }
    })

    return NextResponse.json({
      keywords,
      project: updatedProject
    })
  } catch (error: any) {
    console.error('提取关键词失败:', error)
    return NextResponse.json(
      { error: error.message || '提取关键词失败' },
      { status: 500 }
    )
  }
}
