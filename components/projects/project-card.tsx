'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { PROJECT_STATUS_OPTIONS } from '@/lib/constants'
import { Clock, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    idea: string
    status: string
    type: string
    createdAt: Date
    validationScore?: number | null
    _count?: {
      redditPosts: number
    }
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusOption = PROJECT_STATUS_OPTIONS.find(s => s.value === project.status)

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group relative rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg leading-none tracking-tight group-hover:text-blue-600">
              {project.name}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
              {project.idea}
            </p>
          </div>
          {statusOption && (
            <Badge className={statusOption.color}>
              {statusOption.label}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(project.createdAt), {
              addSuffix: true,
              locale: zhCN
            })}
          </div>

          {project.validationScore !== null && project.validationScore !== undefined && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              评分: {project.validationScore.toFixed(1)}
            </div>
          )}

          {project._count && project._count.redditPosts > 0 && (
            <div className="text-blue-600">
              {project._count.redditPosts} 条验证数据
            </div>
          )}
        </div>

        <div className="mt-3">
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            {project.type}
          </span>
        </div>
      </div>
    </Link>
  )
}
