import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { BookmarkCategory } from '@prisma/client'

// 默认书签数据
const DEFAULT_BOOKMARKS = [
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com',
    description: '技术新闻和讨论社区',
    category: 'NEWS' as BookmarkCategory,
    favicon: 'https://news.ycombinator.com/favicon.ico',
    isDefault: true,
    order: 1,
  },
  {
    name: 'Reddit',
    url: 'https://www.reddit.com',
    description: '全球最大的社区讨论平台',
    category: 'NEWS' as BookmarkCategory,
    favicon: 'https://www.reddit.com/favicon.ico',
    isDefault: true,
    order: 2,
  },
  {
    name: 'Product Hunt',
    url: 'https://www.producthunt.com',
    description: '发现最新产品和工具',
    category: 'NEWS' as BookmarkCategory,
    favicon: 'https://www.producthunt.com/favicon.ico',
    isDefault: true,
    order: 3,
  },
  {
    name: 'Google',
    url: 'https://www.google.com',
    description: '全球最大的搜索引擎',
    category: 'SEARCH' as BookmarkCategory,
    favicon: 'https://www.google.com/favicon.ico',
    isDefault: true,
    order: 4,
  },
  {
    name: 'Google Trends',
    url: 'https://trends.google.com',
    description: '探索搜索趋势和热门话题',
    category: 'SEARCH' as BookmarkCategory,
    favicon: 'https://trends.google.com/favicon.ico',
    isDefault: true,
    order: 5,
  },
  {
    name: 'Google Ads',
    url: 'https://ads.google.com',
    description: '在线广告投放平台',
    category: 'MARKETING' as BookmarkCategory,
    favicon: 'https://ads.google.com/favicon.ico',
    isDefault: true,
    order: 6,
  },
  {
    name: 'Google Analytics',
    url: 'https://analytics.google.com',
    description: '网站流量分析工具',
    category: 'ANALYTICS' as BookmarkCategory,
    favicon: 'https://analytics.google.com/favicon.ico',
    isDefault: true,
    order: 7,
  },
  {
    name: 'Google Search Console',
    url: 'https://search.google.com/search-console',
    description: 'SEO和搜索优化工具',
    category: 'MARKETING' as BookmarkCategory,
    favicon: 'https://www.google.com/favicon.ico',
    isDefault: true,
    order: 8,
  },
  {
    name: 'Google AdSense',
    url: 'https://www.google.com/adsense',
    description: '网站变现广告平台',
    category: 'MONETIZATION' as BookmarkCategory,
    favicon: 'https://www.google.com/favicon.ico',
    isDefault: true,
    order: 9,
  },
]

// 初始化默认书签
async function initializeDefaultBookmarks(userId: string) {
  const existingDefaults = await prisma.bookmark.findMany({
    where: {
      userId,
      isDefault: true,
    },
  })

  if (existingDefaults.length === 0) {
    await prisma.bookmark.createMany({
      data: DEFAULT_BOOKMARKS.map((bookmark) => ({
        ...bookmark,
        userId,
      })),
    })
  }
}

// GET - 获取所有书签
export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 确保用户存在于数据库中
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 初始化默认书签
    await initializeDefaultBookmarks(dbUser.id)

    // 获取所有书签（包括默认书签和用户自定义书签）
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: dbUser.id,
      },
      orderBy: [{ category: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error('Failed to fetch bookmarks:', error)
    return NextResponse.json(
      { error: '获取书签失败' },
      { status: 500 }
    )
  }
}

// POST - 添加新书签
export async function POST(request: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const body = await request.json()
    const { name, url, description, category } = body

    if (!name || !url || !category) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 自动获取 favicon
    let favicon = null
    try {
      const urlObj = new URL(url)
      favicon = `${urlObj.origin}/favicon.ico`
    } catch (e) {
      // 忽略无效的 URL
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        name,
        url,
        description: description || null,
        category,
        favicon,
        isDefault: false,
        userId: dbUser.id,
      },
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error('Failed to create bookmark:', error)
    return NextResponse.json(
      { error: '创建书签失败' },
      { status: 500 }
    )
  }
}
