'use client'

import { useState, useEffect } from 'react'
import { TrendSourceType } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Trash2 } from 'lucide-react'

const SOURCE_TYPE_OPTIONS = [
  { value: 'HACKER_NEWS', label: 'Hacker News' },
  { value: 'REDDIT', label: 'Reddit' },
  { value: 'PRODUCT_HUNT', label: 'Product Hunt' },
  { value: 'GITHUB', label: 'GitHub Trending' },
  { value: 'OTHER', label: '其他' },
]

interface TrendSource {
  id: string
  name: string
  type: string
  icon: string | null
  description: string | null
  isActive: boolean
  rssUrl: string | null
  apiUrl: string | null
}

interface ManageSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  source: TrendSource | null
  onSuccess: () => void
}

export function ManageSourceDialog({
  open,
  onOpenChange,
  source,
  onSuccess,
}: ManageSourceDialogProps) {
  const isEditing = !!source
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'OTHER' as TrendSourceType,
    rssUrl: '',
    apiUrl: '',
    icon: '',
    description: '',
    isActive: true,
  })

  useEffect(() => {
    if (source) {
      setFormData({
        name: source.name,
        type: source.type as TrendSourceType,
        rssUrl: source.rssUrl || '',
        apiUrl: source.apiUrl || '',
        icon: source.icon || '',
        description: source.description || '',
        isActive: source.isActive,
      })
    } else {
      setFormData({
        name: '',
        type: 'OTHER',
        rssUrl: '',
        apiUrl: '',
        icon: '',
        description: '',
        isActive: true,
      })
    }
  }, [source, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing
        ? `/api/trends/sources/${source.id}`
        : '/api/trends/sources'

      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          rssUrl: formData.rssUrl || null,
          apiUrl: formData.apiUrl || null,
          icon: formData.icon || null,
          description: formData.description || null,
        }),
      })

      if (response.ok) {
        alert(isEditing ? '更新成功' : '创建成功')
        onSuccess()
      } else {
        const error = await response.json()
        alert(`操作失败：${error.error}`)
      }
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!source) return

    if (!confirm(`确定要删除订阅源"${source.name}"吗？这将同时删除所有相关的风向标数据。`)) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/trends/sources/${source.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('删除成功')
        onSuccess()
      } else {
        const error = await response.json()
        alert(`删除失败：${error.error}`)
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑订阅源' : '添加订阅源'}</DialogTitle>
          <DialogDescription>
            {isEditing ? '修改订阅源的配置信息' : '添加新的风向标订阅源'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例如: Hacker News"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">类型 *</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as TrendSourceType })
                }
              >
                {SOURCE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">图标 (Emoji)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              placeholder="例如: 🟠"
              maxLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="简短描述这个订阅源..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rssUrl">RSS URL</Label>
            <Input
              id="rssUrl"
              type="url"
              value={formData.rssUrl}
              onChange={(e) =>
                setFormData({ ...formData, rssUrl: e.target.value })
              }
              placeholder="https://example.com/rss.xml"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiUrl">API URL</Label>
            <Input
              id="apiUrl"
              type="url"
              value={formData.apiUrl}
              onChange={(e) =>
                setFormData({ ...formData, apiUrl: e.target.value })
              }
              placeholder="https://api.example.com"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              启用此订阅源
            </Label>
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting || loading}
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? '删除中...' : '删除'}
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading || deleting}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading || deleting}>
                {loading ? (isEditing ? '更新中...' : '创建中...') : (isEditing ? '更新' : '创建')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
