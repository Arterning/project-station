'use client'

import { useState } from 'react'
import { BookmarkCategory } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const CATEGORY_OPTIONS = [
  { value: 'NEWS', label: '新闻资讯' },
  { value: 'MARKETING', label: '营销工具' },
  { value: 'SEARCH', label: '搜索工具' },
  { value: 'MONETIZATION', label: '变现工具' },
  { value: 'DEVELOPMENT', label: '开发工具' },
  { value: 'DESIGN', label: '设计工具' },
  { value: 'ANALYTICS', label: '分析工具' },
  { value: 'PRODUCTIVITY', label: '生产力工具' },
  { value: 'SOCIAL_MEDIA', label: '社交媒体' },
  { value: 'CUSTOM', label: '自定义' },
]

interface AddBookmarkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (bookmark: any) => void
}

export function AddBookmarkDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddBookmarkDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    category: 'CUSTOM' as BookmarkCategory,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const bookmark = await response.json()
        onSuccess(bookmark)
        setFormData({
          name: '',
          url: '',
          description: '',
          category: 'CUSTOM',
        })
      } else {
        alert('添加失败')
      }
    } catch (error) {
      console.error('Failed to add bookmark:', error)
      alert('添加失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>添加网站</DialogTitle>
          <DialogDescription>
            添加你经常访问的网站到导航
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">网站名称</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="例如: GitHub"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">网址 (URL)</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://github.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">分类</Label>
            <Select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as BookmarkCategory })
              }
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述（可选）</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="简短描述这个网站..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '添加中...' : '添加'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
