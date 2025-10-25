import { z } from 'zod'

export const createKeywordSchema = z.object({
  name: z.string().min(1, '关键词名称不能为空').max(100, '关键词名称不能超过100个字符'),
  popularity: z.number().int().min(0).max(100).default(0),
  description: z.string().max(1000, '描述不能超过1000个字符').optional(),
  longTails: z.array(z.string()).default([]),
  projectIds: z.array(z.string()).default([]), // 关联的项目ID列表
})

export const updateKeywordSchema = createKeywordSchema.partial()

export type CreateKeywordInput = z.infer<typeof createKeywordSchema>
export type UpdateKeywordInput = z.infer<typeof updateKeywordSchema>
