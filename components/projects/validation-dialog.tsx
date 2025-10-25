'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, X, Sparkles, Plus } from 'lucide-react'

interface ValidationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  projectIdea: string
  onValidationComplete: () => void
}

export function ValidationDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  projectIdea,
  onValidationComplete,
}: ValidationDialogProps) {
  const [keywords, setKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState('')

  const handleExtractKeywords = async () => {
    setExtracting(true)
    setError('')

    try {
      const response = await fetch(`/api/projects/${projectId}/extract-keywords`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setKeywords(data.keywords)
      } else {
        const error = await response.json()
        setError(error.error || 'AI 提取关键词失败')
      }
    } catch (err) {
      console.error('提取关键词失败:', err)
      setError('提取关键词失败，请手动添加')
    } finally {
      setExtracting(false)
    }
  }

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()])
      setNewKeyword('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  const handleValidate = async () => {
    if (keywords.length === 0) {
      setError('请至少添加一个搜索关键词')
      return
    }

    setValidating(true)
    setError('')

    try {
      const response = await fetch(`/api/projects/${projectId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords }),
      })

      if (response.ok) {
        const data = await response.json()
        onValidationComplete()
        onOpenChange(false)
      } else {
        const error = await response.json()
        setError(error.error || '验证失败')
      }
    } catch (err) {
      console.error('验证失败:', err)
      setError('验证失败，请稍后重试')
    } finally {
      setValidating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>验证项目可行性</DialogTitle>
          <DialogDescription>
            我们将在 Reddit 上搜索相关讨论来验证你的项目想法
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI 提取关键词 */}
          <div>
            <Label>步骤 1: 提取搜索关键词</Label>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-2">
              使用 AI 从项目描述中自动提取关键词，或手动添加
            </p>
            <Button
              onClick={handleExtractKeywords}
              disabled={extracting || validating}
              variant="outline"
              className="w-full"
            >
              {extracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 正在分析...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI 自动提取关键词
                </>
              )}
            </Button>
          </div>

          {/* 关键词列表 */}
          {keywords.length > 0 && (
            <div>
              <Label>当前关键词</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((keyword) => (
                  <div
                    key={keyword}
                    className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      disabled={validating}
                      className="hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 手动添加关键词 */}
          <div>
            <Label htmlFor="newKeyword">添加关键词</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="newKeyword"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                placeholder="输入关键词..."
                disabled={validating}
              />
              <Button
                onClick={handleAddKeyword}
                disabled={!newKeyword.trim() || validating}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {/* 说明 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">验证流程说明：</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>使用关键词在 Reddit 上搜索相关讨论</li>
              <li>收集来自创业、技术等社区的帖子</li>
              <li>AI 分析市场需求和用户反馈</li>
              <li>生成可行性评分和总结报告</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={validating}
          >
            取消
          </Button>
          <Button
            onClick={handleValidate}
            disabled={keywords.length === 0 || validating}
          >
            {validating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                验证中...
              </>
            ) : (
              '开始验证'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
