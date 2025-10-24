'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectCard } from '@/components/projects/project-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Search, Filter } from 'lucide-react'
import { PROJECT_STATUS_OPTIONS, PROJECT_TYPE_OPTIONS } from '@/lib/constants'

interface Project {
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

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [statusFilter, typeFilter, search])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)
      if (search) params.append('search', search)

      const response = await fetch(`/api/projects?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('获取项目失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">我的项目</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            管理和跟踪你的创业项目
          </p>
        </div>
        <Button onClick={() => router.push('/projects/new')}>
          <Plus className="h-4 w-4" />
          新建项目
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="搜索项目名称或描述..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[160px]"
          >
            <option value="">所有状态</option>
            {PROJECT_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-[160px]"
          >
            <option value="">所有类型</option>
            {PROJECT_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* 项目列表 */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 animate-pulse"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-800">
            <Plus className="h-12 w-12 text-zinc-400" />
          </div>
          <h3 className="mt-6 text-lg font-semibold">还没有项目</h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            开始创建你的第一个项目吧
          </p>
          <Button onClick={() => router.push('/projects/new')} className="mt-6">
            <Plus className="h-4 w-4" />
            新建项目
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
