'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, ExternalLink, MessageSquare, TrendingUp, Clock, Shield } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Trend {
  id: string
  title: string
  url: string
  publishedAt: string
  score: number
  commentCount: number
  hotScore: number
  createdAt: string
  updatedAt: string
}

interface TrendSource {
  id: string
  name: string
  type: string
  refreshedAt: string | null
  trends: Trend[]
}

export default function TrendsPage() {
  const [sources, setSources] = useState<TrendSource[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchTrends()
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    // 通过尝试刷新来检测管理员权限
    // 实际项目中可以添加专门的权限检查API
    try {
      const response = await fetch('/api/trends/check-admin')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      }
    } catch {
      // 如果没有check-admin接口，默认false
      setIsAdmin(false)
    }
  }

  const fetchTrends = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/trends')
      if (response.ok) {
        const data = await response.json()
        setSources(data.sources)
      }
    } catch (error) {
      console.error('获取风向标失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!confirm('确定要刷新风向标数据吗？这将删除昨天的数据并获取最新的热门帖子。')) {
      return
    }

    setRefreshing(true)
    try {
      const response = await fetch('/api/trends', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        alert(`成功刷新 ${data.count} 条风向标数据`)
        fetchTrends()
      } else {
        const error = await response.json()
        if (response.status === 403) {
          alert('权限不足：只有管理员可以刷新风向标数据')
        } else {
          alert(`刷新失败：${error.error}`)
        }
      }
    } catch (error) {
      console.error('刷新风向标失败:', error)
      alert('刷新失败')
    } finally {
      setRefreshing(false)
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: zhCN,
      })
    } catch {
      return dateString
    }
  }

  const getHotScoreColor = (hotScore: number) => {
    if (hotScore >= 200) return 'text-red-600 dark:text-red-400'
    if (hotScore >= 100) return 'text-orange-600 dark:text-orange-400'
    return 'text-zinc-600 dark:text-zinc-400'
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
            追踪 Hacker News 等平台的热门技术话题
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        )}
      </div>

      {/* 管理员提示 */}
      {!loading && sources.length === 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                首次使用提示
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                请点击"刷新数据"按钮获取最新的风向标数据。只有管理员用户可以执行刷新操作。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 数据源列表 */}
      {loading ? (
        <div className="space-y-4">
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
          <h3 className="mt-6 text-lg font-semibold">暂无风向标数据</h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            点击"刷新数据"按钮获取最新的热门话题
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sources.map((source) => (
            <div key={source.id} className="space-y-4">
              {/* 数据源标题 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">{source.name}</h2>
                  <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {source.type}
                  </span>
                </div>
                {source.refreshedAt && (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Clock className="h-4 w-4" />
                    <span>更新于 {formatTime(source.refreshedAt)}</span>
                  </div>
                )}
              </div>

              {/* 风向标列表 */}
              {source.trends.length === 0 ? (
                <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    暂无数据
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {source.trends.map((trend, index) => (
                    <div
                      key={trend.id}
                      className="rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* 排名 */}
                        <div className="flex-shrink-0 w-8 text-center">
                          <span className={`text-lg font-bold ${
                            index < 3
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-zinc-400 dark:text-zinc-600'
                          }`}>
                            {index + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* 标题 */}
                          <a
                            href={trend.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-start gap-2 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <h3 className="text-base font-medium leading-snug group-hover:underline">
                              {trend.title}
                            </h3>
                            <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                          </a>

                          {/* 元信息 */}
                          <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              <span>{trend.score} 分</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{trend.commentCount} 评论</span>
                            </div>
                            <div className={`flex items-center gap-1 font-medium ${getHotScoreColor(trend.hotScore)}`}>
                              <span>热度: {trend.hotScore.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(trend.publishedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
