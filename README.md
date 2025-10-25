# VenturePulse - 创业项目管理与验证工具

一个面向个人创业者的 SaaS 工具，帮助你管理创业项目、验证市场可行性，并追踪行业趋势。

## ✨ 核心功能

### 已实现

- ✅ **项目管理**
  - 创建和管理多个创业项目
  - 跟踪项目状态（想法 → 验证中 → 实行中 → MVP发布 → 运行中 → 成功/失败）
  - 记录项目详情（目标市场、收入模式、预算、时长等）
  - 项目筛选和搜索

- ✅ **Reddit 市场验证**
  - AI 自动提取搜索关键词（基于项目描述）
  - 在 Reddit 热门创业社区搜索相关讨论
  - 收集真实用户反馈和市场需求
  - AI 分析生成可行性评分（0-100）
  - 智能总结市场验证结果

- ✅ **用户认证**
  - 基于 Clerk 的安全认证系统

### 待开发

- 🚧 关键词追踪 - 持续监控特定关键词趋势
- 🚧 风向标 - 分析社交媒体热门话题和行业趋势
- 🚧 项目编辑 - 完善的项目编辑功能
- 🚧 更多数据源 - HackerNews、ProductHunt 等

## 🛠 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **数据库**: NeonDB (PostgreSQL)
- **ORM**: Prisma
- **认证**: Clerk
- **样式**: Tailwind CSS 4
- **AI**: OpenAI GPT-4o-mini
- **Reddit API**: Snoowrap
- **表单**: React Hook Form + Zod

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置。详细说明见 [SETUP.md](./SETUP.md)

### 3. 初始化数据库

```bash
pnpm db:push
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 📖 使用指南

### 创建项目

1. 登录后进入"项目"页面
2. 点击"新建项目"填写项目信息

### 验证项目可行性

1. 进入项目详情页，点击"开始验证"
2. AI 自动提取关键词或手动添加
3. 系统在 Reddit 搜索相关讨论
4. AI 分析生成可行性报告

详细使用说明见 [SETUP.md](./SETUP.md)

## 📁 项目结构

```
venture-pulse/
├── app/                    # Next.js App Router
├── components/             # React 组件
├── lib/                    # 工具库
├── prisma/                 # 数据库模型
└── middleware.ts           # 认证中间件
```

## 🔑 主要 API

- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `POST /api/projects/[id]/extract-keywords` - AI 提取关键词
- `POST /api/projects/[id]/validate` - Reddit 验证

## 🎯 路线图

### v1.1
- [ ] 项目编辑功能
- [ ] 验证结果导出

### v1.2
- [ ] 关键词追踪系统
- [ ] 更多数据源集成

### v2.0
- [ ] 风向标功能
- [ ] AI 辅助决策

## 📄 许可证

MIT License
