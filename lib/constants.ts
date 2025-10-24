// 项目状态选项
export const PROJECT_STATUS_OPTIONS = [
  { value: 'IDEA', label: '想法', color: 'bg-gray-100 text-gray-800' },
  { value: 'VALIDATING', label: '验证中', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: '实行中', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'MVP_LAUNCHED', label: 'MVP发布', color: 'bg-purple-100 text-purple-800' },
  { value: 'RUNNING', label: '运行中', color: 'bg-green-100 text-green-800' },
  { value: 'SUCCESS', label: '成功', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'FAILED', label: '失败', color: 'bg-red-100 text-red-800' },
] as const

// 收入模式选项
export const REVENUE_MODEL_OPTIONS = [
  { value: 'SUBSCRIPTION', label: '订阅制' },
  { value: 'ONE_TIME', label: '一次性付费' },
  { value: 'FREEMIUM', label: '免费增值' },
  { value: 'ADVERTISING', label: '广告' },
  { value: 'COMMISSION', label: '佣金' },
  { value: 'OTHER', label: '其他' },
] as const

// 项目类型选项（可根据需要扩展）
export const PROJECT_TYPE_OPTIONS = [
  { value: 'SAAS', label: 'SaaS' },
  { value: 'MARKETPLACE', label: '市场平台' },
  { value: 'ECOMMERCE', label: '电商' },
  { value: 'MOBILE_APP', label: '移动应用' },
  { value: 'WEB_APP', label: 'Web应用' },
  { value: 'AI_TOOL', label: 'AI工具' },
  { value: 'CONTENT', label: '内容产品' },
  { value: 'OTHER', label: '其他' },
] as const

// 预算范围选项
export const BUDGET_OPTIONS = [
  { value: '0-1k', label: '$0 - $1,000' },
  { value: '1k-5k', label: '$1,000 - $5,000' },
  { value: '5k-10k', label: '$5,000 - $10,000' },
  { value: '10k-50k', label: '$10,000 - $50,000' },
  { value: '50k+', label: '$50,000+' },
] as const

// 预期时长选项
export const DURATION_OPTIONS = [
  { value: '1-3months', label: '1-3个月' },
  { value: '3-6months', label: '3-6个月' },
  { value: '6-12months', label: '6-12个月' },
  { value: '1year+', label: '1年以上' },
] as const
