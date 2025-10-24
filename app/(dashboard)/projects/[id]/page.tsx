'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, FlaskConical, Loader2 } from 'lucide-react'
import { PROJECT_STATUS_OPTIONS, REVENUE_MODEL_OPTIONS } from '@/lib/constants'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Project {
  id: string
  name: string
  idea: string
  status: string
  type: string
  startDate?: Date | null
  targetMarket?: string | null
  revenueModel?: string | null
  budget?: string | null
  expectedDuration?: string | null
  validationKeywords: string[]
  validationScore?: number | null
  validationSummary?: string | null
  createdAt: Date
  updatedAt: Date
  redditPosts?: Array<{
    id: string
    title: string
    content: string
    author: string
    subreddit: string
    score: number
    numComments: number
    url: string
    createdAt: Date
  }>
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        router.push('/projects')
      }
    } catch (error) {
      console.error('获取项目详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个项目吗？此操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/projects')
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除项目失败:', error)
      alert('删除失败')
    }
  }

  const handleValidate = async () => {
    setValidating(true)
    // TODO: 实现 Reddit 验证功能
    alert('验证功能将在下一阶段实现')
    setValidating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (!project) {
    return null
  }

  const statusOption = PROJECT_STATUS_OPTIONS.find(s => s.value === project.status)
  const revenueOption = REVENUE_MODEL_OPTIONS.find(r => r.value === project.revenueModel)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              {statusOption && (
                <Badge className={statusOption.color}>
                  {statusOption.label}
                </Badge>
              )}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              创建于 {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
                locale: zhCN
              })}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {project.status === 'IDEA' && (
            <Button onClick={handleValidate} disabled={validating}>
              {validating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FlaskConical className="h-4 w-4" />
              )}
              开始验证
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* 项目详情 */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* 项目描述 */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold mb-3">项目描述</h2>
            <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {project.idea}
            </p>
          </div>

          {/* 目标市场 */}
          {project.targetMarket && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-lg font-semibold mb-3">目标市场</h2>
              <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {project.targetMarket}
              </p>
            </div>
          )}

          {/* 验证结果 */}
          {project.redditPosts && project.redditPosts.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-lg font-semibold mb-4">验证数据 (Reddit)</h2>
              <div className="space-y-4">
                {project.redditPosts.map(post => (
                  <a
                    key={post.id}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-blue-600 hover:underline">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                          <span>r/{post.subreddit}</span>
                          <span>u/{post.author}</span>
                          <span>{post.score} 点赞</span>
                          <span>{post.numComments} 评论</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 项目信息 */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold mb-4">项目信息</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">项目类型</dt>
                <dd className="mt-1 font-medium">{project.type}</dd>
              </div>
              {revenueOption && (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">收入模式</dt>
                  <dd className="mt-1 font-medium">{revenueOption.label}</dd>
                </div>
              )}
              {project.budget && (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">预算范围</dt>
                  <dd className="mt-1 font-medium">{project.budget}</dd>
                </div>
              )}
              {project.expectedDuration && (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">预期时长</dt>
                  <dd className="mt-1 font-medium">{project.expectedDuration}</dd>
                </div>
              )}
              {project.startDate && (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">开始时间</dt>
                  <dd className="mt-1 font-medium">
                    {new Date(project.startDate).toLocaleDateString('zh-CN')}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* 可行性评分 */}
          {project.validationScore !== null && project.validationScore !== undefined && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-lg font-semibold mb-3">可行性评分</h2>
              <div className="text-4xl font-bold text-blue-600">
                {project.validationScore.toFixed(1)}
              </div>
              <div className="mt-2 text-sm text-zinc-500">满分 100 分</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
