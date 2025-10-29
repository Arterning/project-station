'use client'

import { useState, useEffect } from 'react'
import { Plus, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookmarkCategory } from '@prisma/client'
import { AddBookmarkDialog } from './add-bookmark-dialog'

interface Bookmark {
  id: string
  name: string
  url: string
  description: string | null
  category: BookmarkCategory
  favicon: string | null
  isDefault: boolean
}

const DEFAULT_BOOKMARKS = [
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com',
    description: '技术新闻和讨论社区',
    category: 'NEWS' as BookmarkCategory,
    favicon: 'https://news.ycombinator.com/favicon.ico',
  },
  {
    name: 'Reddit',
    url: 'https://www.reddit.com',
    description: '全球最大的社区讨论平台',
    category: 'NEWS' as BookmarkCategory,
    favicon: 'https://www.reddit.com/favicon.ico',
  },
  {
    name: 'Product Hunt',
    url: 'https://www.producthunt.com',
    description: '发现最新产品和工具',
    category: 'NEWS' as BookmarkCategory,
    favicon: 'https://www.producthunt.com/favicon.ico',
  },
  {
    name: 'Google',
    url: 'https://www.google.com',
    description: '全球最大的搜索引擎',
    category: 'SEARCH' as BookmarkCategory,
    favicon: 'https://www.google.com/favicon.ico',
  },
  {
    name: 'Google Trends',
    url: 'https://trends.google.com',
    description: '探索搜索趋势和热门话题',
    category: 'SEARCH' as BookmarkCategory,
    favicon: 'https://trends.google.com/favicon.ico',
  },
  {
    name: 'Google Ads',
    url: 'https://ads.google.com',
    description: '在线广告投放平台',
    category: 'MARKETING' as BookmarkCategory,
    favicon: 'https://ads.google.com/favicon.ico',
  },
  {
    name: 'Google Analytics',
    url: 'https://analytics.google.com',
    description: '网站流量分析工具',
    category: 'ANALYTICS' as BookmarkCategory,
    favicon: 'https://analytics.google.com/favicon.ico',
  },
  {
    name: 'Google Search Console',
    url: 'https://search.google.com/search-console',
    description: 'SEO和搜索优化工具',
    category: 'MARKETING' as BookmarkCategory,
    favicon: 'https://www.google.com/favicon.ico',
  },
  {
    name: 'Google AdSense',
    url: 'https://www.google.com/adsense',
    description: '网站变现广告平台',
    category: 'MONETIZATION' as BookmarkCategory,
    favicon: 'https://www.google.com/favicon.ico',
  },
]

const CATEGORY_NAMES: Record<BookmarkCategory, string> = {
  NEWS: '新闻资讯',
  MARKETING: '营销工具',
  SEARCH: '搜索工具',
  MONETIZATION: '变现工具',
  DEVELOPMENT: '开发工具',
  DESIGN: '设计工具',
  ANALYTICS: '分析工具',
  PRODUCTIVITY: '生产力工具',
  SOCIAL_MEDIA: '社交媒体',
  CUSTOM: '自定义',
}

interface NavigatorContentProps {
  userId: string
}

export function NavigatorContent({ userId }: NavigatorContentProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadBookmarks()
  }, [])

  const loadBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks')
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data)
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个书签吗？')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBookmarks((prev) => prev.filter((b) => b.id !== id))
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('Failed to delete bookmark:', error)
      alert('删除失败')
    } finally {
      setDeletingId(null)
    }
  }

  const handleAddBookmark = (bookmark: Bookmark) => {
    setBookmarks((prev) => [...prev, bookmark])
    setShowAddDialog(false)
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  const groupedBookmarks = bookmarks.reduce((acc, bookmark) => {
    if (!acc[bookmark.category]) {
      acc[bookmark.category] = []
    }
    acc[bookmark.category].push(bookmark)
    return acc
  }, {} as Record<BookmarkCategory, Bookmark[]>)

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          添加网站
        </Button>
      </div>

      {Object.entries(groupedBookmarks).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-xl font-semibold mb-4">
            {CATEGORY_NAMES[category as BookmarkCategory]}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((bookmark) => (
              <a
                key={bookmark.id}
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {bookmark.favicon ? (
                      <img
                        src={bookmark.favicon}
                        alt=""
                        className="w-6 h-6"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800" />
                    )}
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {bookmark.name}
                    </h3>
                  </div>
                  <ExternalLink className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {bookmark.description && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {bookmark.description}
                  </p>
                )}
                {!bookmark.isDefault && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(bookmark.id)
                    }}
                    disabled={deletingId === bookmark.id}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </a>
            ))}
          </div>
        </div>
      ))}

      {bookmarks.length === 0 && (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          <p>还没有添加任何书签</p>
          <p className="text-sm mt-2">点击"添加网站"按钮开始添加</p>
        </div>
      )}

      <AddBookmarkDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddBookmark}
      />
    </div>
  )
}
