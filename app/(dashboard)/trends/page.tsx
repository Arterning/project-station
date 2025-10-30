'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Shield, TrendingUp, Clock, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ManageSourceDialog } from './manage-source-dialog'

interface TrendSource {
  id: string
  name: string
  type: string
  icon: string | null
  description: string | null
  isActive: boolean
  refreshedAt: string | null
  trendCount: number
  createdAt: string
  updatedAt: string
}

export default function TrendsPage() {
  const router = useRouter()
  const [sources, setSources] = useState<TrendSource[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<TrendSource | null>(null)

  useEffect(() => {
    fetchSources()
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/trends/check-admin')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      }
    } catch {
      setIsAdmin(false)
    }
  }

  const fetchSources = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/trends/sources')
      if (response.ok) {
        const data = await response.json()
        setSources(data.sources)
      }
    } catch (error) {
      console.error('获取订阅源失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSource = () => {
    setEditingSource(null)
    setManageDialogOpen(true)
  }

  const handleEditSource = (source: TrendSource, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSource(source)
    setManageDialogOpen(true)
  }

  const handleSourceClick = (sourceId: string) => {
    router.push(`/trends/${sourceId}`)
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '未刷新'
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: zhCN,
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">技术风向标</h1>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Shield className="h-3 w-3" />
                管理员
              </span>
            )}
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            追踪 Hacker News、Reddit 等平台的热门技术话题
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleAddSource}>
            <Plus className="h-4 w-4" />
            添加订阅源
          </Button>
        )}
      </div>

      {/* 订阅源卡片列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 animate-pulse"
            />
          ))}
        </div>
      ) : sources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-800">
            <TrendingUp className="h-12 w-12 text-zinc-400" />
          </div>
          <h3 className="mt-6 text-lg font-semibold">暂无订阅源</h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {isAdmin ? '点击"添加订阅源"按钮开始添加' : '请联系管理员添加订阅源'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sources.map((source) => (
            <div
              key={source.id}
              onClick={() => handleSourceClick(source.id)}
              className="group relative rounded-lg border border-zinc-200 bg-white p-6 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 transition-all cursor-pointer"
            >
              {/* 订阅源图标和名称 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{source.icon || '📊'}</div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {source.name}
                    </h3>
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 mt-1">
                      {source.type}
                    </span>
                  </div>
                </div>
                {!source.isActive && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-600">
                    已禁用
                  </span>
                )}
              </div>

              {/* 描述 */}
              {source.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                  {source.description}
                </p>
              )}

              {/* 元信息 */}
              <div className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{source.trendCount} 条内容</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>更新于 {formatTime(source.refreshedAt)}</span>
                </div>
              </div>

              {/* 管理员编辑按钮 */}
              {isAdmin && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleEditSource(source, e)}
                  >
                    编辑
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 管理订阅源对话框 */}
      <ManageSourceDialog
        open={manageDialogOpen}
        onOpenChange={setManageDialogOpen}
        source={editingSource}
        onSuccess={() => {
          fetchSources()
          setManageDialogOpen(false)
        }}
      />
    </div>
  )
}
