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

🚧 待实现：
- Reddit 数据验证功能
- AI 可行性分析
- 关键词追踪
- 风向标功能
- 项目编辑功能
- 标签系统

## 下一步开发

1. **Reddit 验证功能**
   - 集成 Reddit API
   - 实现关键词搜索
   - AI 自动提取关键词
   - 展示验证数据

2. **AI 可行性分析**
   - 集成 AI API（如 OpenAI）
   - 分析 Reddit 数据
   - 生成可行性评分和总结

3. **项目编辑**
   - 创建编辑页面
   - 实现状态更新

4. **优化**
   - 添加加载状态
   - 错误处理
   - 响应式设计改进

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
