'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createProjectSchema, type CreateProjectInput } from '@/lib/validations/project'
import {
  PROJECT_TYPE_OPTIONS,
  REVENUE_MODEL_OPTIONS,
  BUDGET_OPTIONS,
  DURATION_OPTIONS
} from '@/lib/constants'

export default function NewProjectPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      tags: [],
    },
  })

  const onSubmit = async (data: CreateProjectInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const project = await response.json()
        router.push(`/projects/${project.id}`)
      } else {
        const error = await response.json()
        alert(error.error || '创建项目失败')
      }
    } catch (error) {
      console.error('创建项目失败:', error)
      alert('创建项目失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新建项目</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            创建一个新的创业项目并开始验证
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="space-y-4">
            {/* 项目名称 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                项目名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="例如：智能待办事项管理工具"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* 项目描述 */}
            <div className="space-y-2">
              <Label htmlFor="idea">
                项目描述 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="idea"
                rows={6}
                placeholder="详细描述你的项目想法、要解决的问题、目标用户等..."
                {...register('idea')}
              />
              {errors.idea && (
                <p className="text-sm text-red-500">{errors.idea.message}</p>
              )}
            </div>

            {/* 项目类型 */}
            <div className="space-y-2">
              <Label htmlFor="type">
                项目类型 <span className="text-red-500">*</span>
              </Label>
              <Select id="type" {...register('type')}>
                <option value="">请选择</option>
                {PROJECT_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* 目标市场 */}
            <div className="space-y-2">
              <Label htmlFor="targetMarket">目标市场/用户群体</Label>
              <Textarea
                id="targetMarket"
                rows={3}
                placeholder="例如：25-40岁的职场人士，需要提高工作效率..."
                {...register('targetMarket')}
              />
            </div>

            {/* 收入模式 */}
            <div className="space-y-2">
              <Label htmlFor="revenueModel">预期收入模式</Label>
              <Select id="revenueModel" {...register('revenueModel')}>
                <option value="">请选择</option>
                {REVENUE_MODEL_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* 预算范围 */}
              <div className="space-y-2">
                <Label htmlFor="budget">预算范围</Label>
                <Select id="budget" {...register('budget')}>
                  <option value="">请选择</option>
                  {BUDGET_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* 预期时长 */}
              <div className="space-y-2">
                <Label htmlFor="expectedDuration">预期时长</Label>
                <Select id="expectedDuration" {...register('expectedDuration')}>
                  <option value="">请选择</option>
                  {DURATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* 项目开始时间 */}
            <div className="space-y-2">
              <Label htmlFor="startDate">项目开始时间</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            创建项目
          </Button>
        </div>
      </form>
    </div>
  )
}
