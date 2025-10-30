'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Trash2, Edit, TrendingUp } from 'lucide-react'
import { KeywordDialog } from '@/components/keywords/keyword-dialog'

interface Project {
  id: string
  name: string
  status: string
}

interface Keyword {
  id: string
  name: string
  popularity: number
  description?: string | null
  longTails: string[]
  projectCount: number
  projects: Project[]
  createdAt: Date
  updatedAt: Date
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null)

  useEffect(() => {
    fetchKeywords()
  }, [search])

  const fetchKeywords = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)

      const response = await fetch(`/api/keywords?${params}`)
      if (response.ok) {
        const data = await response.json()
        setKeywords(data)
      }
    } catch (error) {
      console.error('获取关键词失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个关键词吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/keywords/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setKeywords(keywords.filter(k => k.id !== id))
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除关键词失败:', error)
      alert('删除失败')
    }
  }

  const handleEdit = (keyword: Keyword) => {
    setEditingKeyword(keyword)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingKeyword(null)
  }

  const handleSuccess = () => {
    fetchKeywords()
    handleDialogClose()
  }

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 70) return 'text-red-600 dark:text-red-400'
    if (popularity >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-zinc-600 dark:text-zinc-400'
  }

  const getPopularityLabel = (popularity: number) => {
    if (popularity >= 70) return '高热度'
    if (popularity >= 40) return '中热度'
    return '低热度'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">关键词追踪</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            追踪和管理你感兴趣的市场关键词
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          添加关键词
        </Button>
      </div>

      {/* 搜索 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="搜索关键词..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 关键词列表 */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 animate-pulse"
            />
          ))}
        </div>
      ) : keywords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-800">
            <TrendingUp className="h-12 w-12 text-zinc-400" />
          </div>
          <h3 className="mt-6 text-lg font-semibold">还没有关键词</h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            开始添加你感兴趣的市场关键词吧
          </p>
          <Button onClick={() => setDialogOpen(true)} className="mt-6">
            <Plus className="h-4 w-4" />
            添加关键词
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {keywords.map(keyword => (
            <div
              key={keyword.id}
              className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{keyword.name}</h3>
                    <div className={`flex items-center gap-1 text-sm ${getPopularityColor(keyword.popularity)}`}>
                      <TrendingUp className="h-4 w-4" />
                      <span>{keyword.popularity}</span>
                      <span className="text-xs">· {getPopularityLabel(keyword.popularity)}</span>
                    </div>
                  </div>

                  {keyword.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {keyword.description}
                    </p>
                  )}

                  {keyword.longTails.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mb-2">
                        长尾词:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {keyword.longTails.map((tail, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            {tail}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {keyword.projects.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mb-2">
                        关联项目 ({keyword.projectCount}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {keyword.projects.map(project => (
                          <span
                            key={project.id}
                            className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          >
                            {project.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(keyword)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(keyword.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <KeywordDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleSuccess}
        keyword={editingKeyword}
      />
    </div>
  )
}
