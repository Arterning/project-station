import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { searchSubreddits } from '@/lib/reddit'
import { analyzeRedditData } from '@/lib/openai'

// POST /api/projects/[id]/validate - 验证项目（搜索 Reddit 并分析）
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
    const body = await req.json()
    const { keywords } = body

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: '请提供搜索关键词' },
        { status: 400 }
      )
    }

    // 检查 API 配置
    if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Reddit API 未配置，请联系管理员' },
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

    // 更新项目状态为"验证中"
    await prisma.project.update({
      where: { id },
      data: {
        status: 'VALIDATING',
        validationKeywords: keywords
      }
    })

    // 搜索 Reddit
    const redditPosts = await searchSubreddits(
      keywords,
      ['Entrepreneur', 'startups', 'SaaS', 'technology', 'business', 'smallbusiness'],
      {
        limit: 10,
        sort: 'relevance',
        time: 'month'
      }
    )

    // 存储 Reddit 帖子到数据库
    const savedPosts = []
    for (const post of redditPosts) {
      try {
        // 检查是否已存在
        const existing = await prisma.redditPost.findUnique({
          where: { redditId: post.id }
        })

        if (!existing) {
          const saved = await prisma.redditPost.create({
            data: {
              redditId: post.id,
              title: post.title,
              content: post.selftext,
              author: post.author,
              subreddit: post.subreddit,
              score: post.score,
              numComments: post.num_comments,
              url: post.url,
              createdAt: new Date(post.created_utc * 1000),
              projectId: id
            }
          })
          savedPosts.push(saved)
        } else {
          savedPosts.push(existing)
        }
      } catch (err) {
        console.error('保存帖子失败:', err)
      }
    }

    // 使用 AI 分析数据（如果配置了 OpenAI）
    let validationScore = null
    let validationSummary = null

    if (process.env.OPENAI_API_KEY && savedPosts.length > 0) {
      try {
        const analysis = await analyzeRedditData(
          project.idea,
          savedPosts.map(post => ({
            title: post.title,
            content: post.content,
            score: post.score,
            num_comments: post.numComments,
            subreddit: post.subreddit
          }))
        )

        validationScore = analysis.score
        validationSummary = analysis.summary
      } catch (err) {
        console.error('AI 分析失败:', err)
      }
    }

    // 更新项目
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        validationScore,
        validationSummary
      },
      include: {
        redditPosts: {
          orderBy: {
            score: 'desc'
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      postsFound: savedPosts.length,
      project: updatedProject
    })
  } catch (error: any) {
    console.error('验证失败:', error)

    // 尝试恢复项目状态
    try {
      const { id } = await params
      await prisma.project.update({
        where: { id },
        data: { status: 'IDEA' }
      })
    } catch (e) {
      console.error('恢复项目状态失败:', e)
    }

    return NextResponse.json(
      { error: error.message || '验证失败，请稍后重试' },
      { status: 500 }
    )
  }
}
