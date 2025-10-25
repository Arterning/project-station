# 风向标功能使用文档

## 功能概述

风向标功能用于追踪 Hacker News 等技术平台的热门话题，帮助用户了解当前技术趋势。

## 主要特性

- ✅ 从 Hacker News 获取 Top 50 热门帖子
- ✅ 综合评分和评论数计算热度（热度 = 评分 × 0.6 + 评论数 × 0.4）
- ✅ 管理员手动刷新数据（配置 .env 中的管理员邮箱）
- ✅ 自动清理昨天的旧数据
- ✅ 可扩展架构，支持后续添加其他数据源（Reddit、Product Hunt、GitHub Trending 等）
- ✅ 所有用户共享同一份风向标数据

## 配置步骤

### 1. 配置管理员邮箱

在 `.env` 文件中添加管理员邮箱（多个邮箱用逗号分隔）：

```env
ADMIN_EMAILS=your-email@example.com,admin2@example.com
```

**注意**：这里的邮箱必须与 Clerk 认证系统中注册的用户邮箱完全一致。

### 2. 数据库迁移

如果数据库尚未同步 schema，运行：

```bash
pnpm prisma db push
```

或创建迁移：

```bash
pnpm prisma migrate dev --name add_trends
```

### 3. 重新生成 Prisma Client

```bash
pnpm prisma generate
```

## 使用方法

### 访问风向标页面

启动应用后，在导航栏点击"风向标"，或直接访问：

```
http://localhost:3000/trends
```

### 刷新数据（仅管理员）

1. 以管理员账号登录（邮箱在 `ADMIN_EMAILS` 中配置）
2. 访问风向标页面
3. 页面标题旁边会显示"管理员"标签
4. 点击右上角的"刷新数据"按钮
5. 确认后，系统会：
   - 删除昨天的旧数据
   - 从 Hacker News API 获取最新 Top 50 热门帖子
   - 计算每条帖子的热度分数
   - 按热度排序展示

### 查看数据（所有用户）

- 所有登录用户都可以查看风向标数据
- 数据按热度从高到低排序
- 每条帖子显示：
  - 排名（Top 3 高亮显示）
  - 标题（点击跳转到 Hacker News 原帖）
  - 评分（points）
  - 评论数
  - 综合热度
  - 发布时间

## API 接口

### GET /api/trends

获取当前所有活跃数据源的风向标数据。

**权限**：需要登录

**响应示例**：

```json
{
  "sources": [
    {
      "id": "source-id",
      "name": "Hacker News",
      "type": "HACKER_NEWS",
      "refreshedAt": "2025-10-25T08:00:00Z",
      "trends": [
        {
          "id": "trend-id",
          "title": "Show HN: My New Project",
          "url": "https://example.com",
          "publishedAt": "2025-10-25T07:30:00Z",
          "score": 250,
          "commentCount": 120,
          "hotScore": 198.0,
          "createdAt": "2025-10-25T08:00:00Z",
          "updatedAt": "2025-10-25T08:00:00Z"
        }
      ]
    }
  ]
}
```

### POST /api/trends

刷新风向标数据（仅管理员）。

**权限**：需要管理员权限

**响应示例**：

```json
{
  "message": "Trends refreshed successfully",
  "source": { /* 数据源详情 */ },
  "count": 50
}
```

**错误响应**：

- 401: 未登录
- 403: 非管理员用户
- 500: 服务器错误

### GET /api/trends/check-admin

检查当前用户是否为管理员。

**权限**：需要登录

**响应示例**：

```json
{
  "isAdmin": true
}
```

## 数据模型

### TrendSource（数据源）

- `id`: 唯一标识
- `name`: 数据源名称（如 "Hacker News"）
- `type`: 数据源类型（枚举：HACKER_NEWS, REDDIT, PRODUCT_HUNT, GITHUB, OTHER）
- `rssUrl`: RSS feed URL（可选）
- `apiUrl`: API URL（可选）
- `isActive`: 是否启用
- `refreshedAt`: 最后刷新时间

### Trend（风向标帖子）

- `id`: 唯一标识
- `title`: 帖子标题
- `url`: 帖子原始链接
- `publishedAt`: 帖子发布时间
- `score`: 评分/点赞数
- `commentCount`: 评论数
- `hotScore`: 综合热度得分
- `sourceId`: 所属数据源

## 扩展其他数据源

架构已预留扩展接口，后续可添加：

### 1. 在 `lib/rss.ts` 中实现新的数据源

```typescript
// 示例：添加 Reddit 数据源
export async function fetchRedditTrends(limit: number = 50): Promise<ParsedRSSItem[]> {
  // 实现 Reddit 数据获取逻辑
}
```

### 2. 在 `fetchTrendData` 函数中添加新的 case

```typescript
case 'REDDIT':
  return await fetchRedditTrends(limit);
```

### 3. 在前端页面支持多数据源切换

已支持多数据源展示，新数据源会自动在页面上显示。

## 热度计算公式

```
热度分数 = 评分 × 0.6 + 评论数 × 0.4
```

- 评分权重 60%：反映内容质量和用户认可度
- 评论数权重 40%：反映讨论热度和参与度

可在 `lib/rss.ts` 的 `calculateHotScore` 函数中调整权重。

## 注意事项

1. **管理员权限**：确保 `.env` 中配置的邮箱与 Clerk 用户邮箱完全匹配
2. **数据清理**：每次刷新会删除昨天的数据，保持数据新鲜
3. **API 限制**：Hacker News API 有速率限制，请勿频繁刷新
4. **时区设置**：删除昨天数据基于服务器时区，建议使用 UTC 或北京时间（UTC+8）

## 故障排除

### 刷新按钮不显示

- 检查 `.env` 中是否正确配置了 `ADMIN_EMAILS`
- 确认当前登录用户的邮箱在管理员列表中
- 查看浏览器控制台是否有错误

### 刷新失败

- 检查网络连接是否正常
- 查看服务器日志（控制台输出）
- 确认 Hacker News API 是否可访问

### 数据不显示

- 确认是否已执行过至少一次刷新
- 检查数据库连接是否正常
- 查看浏览器控制台和服务器日志

## 技术栈

- **数据源**：Hacker News Official API
- **后端**：Next.js 16 App Router、Prisma ORM、PostgreSQL
- **前端**：React 19、Tailwind CSS 4、date-fns
- **认证**：Clerk
- **RSS 解析**：rss-parser（预留，当前使用官方 API）
