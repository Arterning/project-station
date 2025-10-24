import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空').max(100, '项目名称不能超过100个字符'),
  idea: z.string().min(10, '项目描述至少需要10个字符').max(5000, '项目描述不能超过5000个字符'),
  type: z.string().min(1, '请选择项目类型'),
  startDate: z.string().optional(),
  targetMarket: z.string().optional(),
  revenueModel: z.enum(['SUBSCRIPTION', 'ONE_TIME', 'FREEMIUM', 'ADVERTISING', 'COMMISSION', 'OTHER']).optional(),
  budget: z.string().optional(),
  expectedDuration: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['IDEA', 'VALIDATING', 'IN_PROGRESS', 'MVP_LAUNCHED', 'RUNNING', 'SUCCESS', 'FAILED']).optional(),
  validationKeywords: z.array(z.string()).optional(),
  validationScore: z.number().min(0).max(100).optional(),
  validationSummary: z.string().optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
