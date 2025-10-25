# VenturePulse 设置指南

## 项目概述

VenturePulse 是一个面向个人创业者的 SaaS 工具，主要功能包括：
- 创建和管理创业项目
- 项目可行性评估
- Reddit 数据验证
- 关键词追踪
- 风向标（社交数据分析）

## 技术栈

- **框架**: Next.js 16 (App Router)
- **数据库**: NeonDB (PostgreSQL)
- **ORM**: Prisma
- **认证**: Clerk
- **样式**: Tailwind CSS
- **表单**: React Hook Form + Zod
- **UI 组件**: 自定义组件库

## 环境设置

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写以下配置：

#### 数据库配置 (NeonDB)

1. 访问 [https://neon.tech](https://neon.tech) 创建账号
2. 创建一个新项目
3. 复制连接字符串到 `DATABASE_URL`

```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

#### Clerk 认证配置

1. 访问 [https://clerk.com](https://clerk.com) 创建账号
2. 创建一个新应用
3. 在 "API Keys" 页面获取密钥

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/projects
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/projects

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 数据库设置

生成 Prisma Client：

```bash
pnpm db:generate
```

推送数据库结构（开发环境）：

```bash
pnpm db:push
```

或者创建迁移（生产环境）：

```bash
pnpm db:migrate
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 可用脚本

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm lint` - 运行代码检查
- `pnpm db:generate` - 生成 Prisma Client
- `pnpm db:push` - 推送数据库结构
- `pnpm db:migrate` - 创建数据库迁移
- `pnpm db:studio` - 打开 Prisma Studio

## 数据库结构

### User (用户)
- 与 Clerk 用户关联
- 存储用户基本信息

### Project (项目)
- 项目名称、描述、类型
- 项目状态（想法、验证中、实行中、MVP发布、运行中、成功、失败）
- 目标市场、收入模式、预算、时长
- 验证关键词、评分、总结

### RedditPost (Reddit 帖子)
- 用于项目验证的 Reddit 数据
- 帖子标题、内容、作者、评分等

## 功能实现状态

✅ 已完成：
- 用户认证（Clerk）
- 项目 CRUD 操作
- 项目列表页面（带筛选和搜索）
- 新建项目表单
- 项目详情页面
- 数据库模型设计
- ✨ **Reddit 数据验证功能**
  - AI 自动提取关键词（OpenAI）
  - Reddit API 搜索相关帖子
  - 存储验证数据到数据库
  - AI 分析生成可行性评分和总结
  - 验证对话框 UI

🚧 待实现：
- 关键词追踪
- 风向标功能
- 项目编辑功能
- 标签系统
- 验证结果改进（更多数据源）

## Reddit 验证功能使用指南

### 配置 Reddit API

1. 访问 [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. 点击 "create another app..." 或 "are you a developer? create an app..."
3. 填写信息：
   - **name**: VenturePulse (或任意名称)
   - **App type**: 选择 "script"
   - **description**: 项目验证工具
   - **about url**: 留空
   - **redirect uri**: http://localhost:3000 (必填但不会使用)
4. 创建后获取：
   - **client_id**: 应用 ID（标题下方的字符串）
   - **client_secret**: secret 字段的值

5. 在 `.env` 文件中配置：

```env
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_USER_AGENT=VenturePulse/1.0.0
```

### 配置 OpenAI API

1. 访问 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. 创建新的 API 密钥
3. 在 `.env` 文件中配置：

```env
OPENAI_API_KEY=sk-xxxxx
```

### 使用验证功能

1. 创建一个新项目（状态为"想法"）
2. 进入项目详情页
3. 点击"开始验证"按钮
4. 在弹出的对话框中：
   - 点击"AI 自动提取关键词"（需要 OpenAI API）
   - 或手动添加搜索关键词
   - 点击"开始验证"

5. 系统将：
   - 更新项目状态为"验证中"
   - 在 Reddit 搜索相关讨论（Entrepreneur, startups, SaaS 等社区）
   - 保存找到的帖子到数据库
   - 使用 AI 分析数据并生成：
     - 可行性评分（0-100）
     - 市场验证总结

6. 验证完成后，项目详情页将显示：
   - AI 可行性分析（评分和总结）
   - 搜索关键词
   - Reddit 帖子列表（带评分、评论数等）

## API 路由说明

### Reddit 验证相关

- `POST /api/projects/[id]/extract-keywords` - AI 提取关键词
- `POST /api/projects/[id]/validate` - 执行 Reddit 验证

## 下一步开发

1. **项目编辑功能**
   - 创建编辑页面
   - 实现状态更新
   - 支持修改项目信息

2. **关键词追踪**
   - 追踪特定关键词的趋势
   - 定期抓取更新
   - 通知功能

3. **风向标功能**
   - 分析热门话题
   - 趋势预测
   - 行业洞察

4. **优化和改进**
   - 验证结果缓存
   - 更多数据源（HackerNews, ProductHunt 等）
   - 批量验证
   - 导出验证报告

## 故障排除

### Prisma 错误

如果遇到 Prisma Client 错误：

```bash
pnpm db:generate
```

### 数据库连接问题

确保 NeonDB 连接字符串正确，包含 `?sslmode=require` 参数。

### Clerk 认证问题

确保所有 Clerk 环境变量都已正确设置，且密钥与应用匹配。
