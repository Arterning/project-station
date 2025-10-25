'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Plus } from 'lucide-react'

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
  projects: Project[]
}

interface KeywordDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  keyword?: Keyword | null
}

export function KeywordDialog({ open, onClose, onSuccess, keyword }: KeywordDialogProps) {
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState({
    name: '',
    popularity: 0,
    description: '',
    longTails: [] as string[],
    projectIds: [] as string[],
  })
  const [newLongTail, setNewLongTail] = useState('')

  useEffect(() => {
    if (open) {
      fetchProjects()
      if (keyword) {
        setFormData({
          name: keyword.name,
          popularity: keyword.popularity,
          description: keyword.description || '',
          longTails: keyword.longTails,
          projectIds: keyword.projects.map(p => p.id),
        })
      } else {
        setFormData({
          name: '',
          popularity: 0,
          description: '',
          longTails: [],
          projectIds: [],
        })
      }
    }
  }, [open, keyword])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('获取项目列表失败:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = keyword ? `/api/keywords/${keyword.id}` : '/api/keywords'
      const method = keyword ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || '保存失败')
      }
    } catch (error) {
      console.error('保存关键词失败:', error)
      alert('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const addLongTail = () => {
    if (newLongTail.trim()) {
      setFormData({
        ...formData,
        longTails: [...formData.longTails, newLongTail.trim()],
      })
      setNewLongTail('')
    }
  }

  const removeLongTail = (index: number) => {
    setFormData({
      ...formData,
      longTails: formData.longTails.filter((_, i) => i !== index),
    })
  }

  const toggleProject = (projectId: string) => {
    setFormData({
      ...formData,
      projectIds: formData.projectIds.includes(projectId)
        ? formData.projectIds.filter(id => id !== projectId)
        : [...formData.projectIds, projectId],
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{keyword ? '编辑关键词' : '添加关键词'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">关键词名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如: image generator"
              required
            />
          </div>

          <div>
            <Label htmlFor="popularity">热度 (0-100)</Label>
            <Input
              id="popularity"
              type="number"
              min="0"
              max="100"
              value={formData.popularity}
              onChange={(e) => setFormData({ ...formData, popularity: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="关键词的详细描述..."
              rows={3}
            />
          </div>

          <div>
            <Label>长尾词</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newLongTail}
                  onChange={(e) => setNewLongTail(e.target.value)}
                  placeholder="添加长尾词..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addLongTail()
                    }
                  }}
                />
                <Button type="button" onClick={addLongTail} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.longTails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.longTails.map((tail, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-sm dark:bg-zinc-800"
                    >
                      {tail}
                      <button
                        type="button"
                        onClick={() => removeLongTail(index)}
                        className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>关联项目</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-md p-2">
              {projects.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-2">
                  暂无项目
                </p>
              ) : (
                projects.map(project => (
                  <label
                    key={project.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.projectIds.includes(project.id)}
                      onChange={() => toggleProject(project.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{project.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
