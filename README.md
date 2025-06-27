# Streaming Usage Platform

一个现代化的流媒体使用监控平台，帮助用户追踪和管理多个流媒体服务的使用情况、消费和预算。

## 🚀 功能特性

### 📊 使用监控
- **多服务支持**: Netflix、Amazon Prime、Disney+、Hulu、HBO Max、Spotify、Apple Music、YouTube Premium、Twitch 等
- **实时数据追踪**: 观看时长、剧集数量、数据使用量等详细统计
- **可视化图表**: 使用 ECharts 提供丰富的图表展示
- **时间维度分析**: 支持日、周、月、年等不同时间维度的数据分析

### 💰 预算管理
- **预算设置**: 为不同服务设置月度/年度预算
- **智能告警**: 50%、80%、100% 预算使用率告警
- **消费分析**: 详细的消费趋势和预算执行情况
- **多币种支持**: 支持 USD、EUR、CNY 等多种货币

### 🔐 用户系统
- **多种登录方式**: 支持邮箱密码和 OAuth 登录
- **个性化设置**: 用户偏好、通知设置、隐私控制
- **多账户管理**: 支持同一服务的多个账户

### 📱 现代化界面
- **响应式设计**: 支持桌面端和移动端
- **暗色主题**: 基于 Tailwind CSS 的现代化 UI
- **流畅动画**: 使用 Framer Motion 提供流畅的用户体验
- **实时更新**: 基于 React Query 的数据实时同步

## 🛠 技术栈

### 前端
- **框架**: Next.js 15.3.3 (App Router)
- **UI 库**: React 19 + Ant Design 5.26.2
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand 5.0.5
- **数据获取**: TanStack React Query 5.80.7
- **表单处理**: React Hook Form 7.58.1 + Zod 3.25.67
- **图表**: ECharts 5.6.0
- **动画**: Framer Motion 12.18.1

### 后端
- **数据库**: MySQL 8.0 (主数据库) + InfluxDB 2.0 (时序数据)
- **缓存**: Redis 7
- **ORM**: Prisma 6.10.0
- **认证**: NextAuth.js 4.24.11
- **API**: Next.js API Routes

### 部署
- **容器化**: Docker + Docker Compose
- **数据库管理**: Adminer 4.8.1

## 📦 快速开始

### 环境要求
- Node.js 18+ 
- Docker & Docker Compose
- Git

### 1. 克隆项目
```bash
git clone <repository-url>
cd streaming-usage-platform
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
创建 `.env.local` 文件：
```env
# 数据库配置
DATABASE_URL="mysql://streaming_user:streaming_pass_123@localhost:3306/streaming_usage"

# NextAuth 配置
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:4000

# InfluxDB 配置
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=my_super_secret_admin_token_123456789
INFLUX_ORG=streaming-org
INFLUX_BUCKET=usage-data

# Redis 配置
REDIS_URL=redis://:redis_pass_123@localhost:6379
```

### 4. 启动服务
```bash
# 一键启动所有服务（推荐）
npm run setup-db

# 或者分步启动
docker-compose up -d
```

### 5. 数据库迁移
```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev
```

### 6. 启动应用
```bash
npm run dev
```

访问 http://localhost:4000 查看应用。

## 🏗 项目结构

```
streaming-usage-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── actions/           # Server Actions
│   │   │   └── auth.ts        # 认证相关操作
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 认证 API
│   │   │   ├── data/          # 数据 API
│   │   │   └── init-data/     # 数据初始化 API
│   │   ├── auth/              # 认证页面
│   │   │   ├── login/         # 登录页面
│   │   │   └── register/      # 注册页面
│   │   ├── monitoring/        # 监控页面
│   │   ├── usage/             # 使用统计页面
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页
│   │   └── providers.tsx      # 全局 Provider
│   ├── lib/                   # 工具库
│   │   ├── auth/              # 认证配置
│   │   ├── db/                # 数据库配置
│   │   │   ├── prisma.ts      # Prisma 客户端
│   │   │   └── redis.ts       # Redis 客户端
│   │   ├── theme.ts           # 主题配置
│   │   └── utils.ts           # 工具函数
│   ├── types/                 # TypeScript 类型定义
│   └── middleware.ts          # 中间件
├── prisma/                    # 数据库配置
│   ├── schema.prisma          # 数据库模型
│   └── migrations/            # 数据库迁移
├── docker/                    # Docker 配置
│   ├── mysql/                 # MySQL 配置
│   ├── influxdb/              # InfluxDB 配置
│   └── redis/                 # Redis 配置
├── scripts/                   # 脚本文件
├── public/                    # 静态资源
├── docker-compose.yml         # Docker 服务配置
├── tailwind.config.ts         # Tailwind 配置
├── next.config.ts             # Next.js 配置
└── package.json               # 项目配置
```

## 🗄 数据库设计

### 核心模型

#### User (用户)
- 基本信息：邮箱、姓名、头像
- 认证信息：密码、邮箱验证
- 关联：账户、会话、偏好设置、预算、使用记录

#### StreamingAccount (流媒体账户)
- 服务类型：Netflix、Disney+ 等
- 订阅信息：月费、币种、账单日期
- API 集成：API 密钥、用户名
- 关联：用户、使用记录

#### UsageRecord (使用记录)
- 使用数据：日期、时长、剧集数、数据使用量
- 内容信息：类型、分类、质量
- 关联：用户、账户

#### Budget (预算)
- 预算信息：名称、金额、币种、周期
- 告警设置：50%、80%、100% 告警阈值
- 关联：用户

## 🔌 API 接口

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/session` - 获取会话信息

### 数据相关
- `GET /api/data/usage` - 获取使用数据
- `POST /api/data/usage` - 添加使用记录
- `GET /api/data/budget` - 获取预算信息
- `POST /api/data/budget` - 创建预算

### 初始化
- `POST /api/init-data` - 初始化测试数据

## 🎨 界面预览

### 主要页面
- **首页**: 概览仪表板，显示关键指标
- **监控页面**: 详细的使用数据图表
- **使用统计**: 按服务分类的使用情况
- **预算管理**: 预算设置和消费分析
- **用户设置**: 个人偏好和通知设置

### 特色功能
- **实时图表**: 使用 ECharts 展示数据趋势
- **响应式布局**: 适配各种屏幕尺寸
- **暗色主题**: 护眼的暗色界面
- **流畅动画**: 页面切换和交互动画

## 🚀 部署

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
# 构建应用
npm run build

# 启动生产服务器
npm start
```

### Docker 部署
```bash
# 构建镜像
docker build -t streaming-usage-platform .

# 启动服务
docker-compose up -d
```

## 🔧 开发指南

### 添加新的流媒体服务
1. 在 `prisma/schema.prisma` 中的 `StreamingService` 枚举添加新服务
2. 运行 `npx prisma migrate dev` 更新数据库
3. 在相关组件中添加新服务的图标和配置

### 自定义图表
1. 在 `src/app/monitoring/components/` 中创建新的图表组件
2. 使用 ECharts 配置图表样式
3. 在页面中集成新组件

### 添加新的数据字段
1. 更新 Prisma schema
2. 运行数据库迁移
3. 更新相关的 API 和组件

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查 Docker 服务状态
   docker-compose ps
   
   # 重启数据库服务
   docker-compose restart mysql influxdb redis
   ```

2. **Prisma 客户端错误**
   ```bash
   # 重新生成客户端
   npx prisma generate
   
   # 重置数据库
   npx prisma migrate reset
   ```

3. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :4000
   
   # 修改 docker-compose.yml 中的端口映射
   ```

### 日志查看
```bash
# 查看应用日志
npm run dev

# 查看 Docker 服务日志
docker-compose logs -f

# 查看特定服务日志
docker logs streaming-mysql
docker logs streaming-influxdb
docker logs streaming-redis
```

## 📊 性能优化

### 数据库优化
- 使用 InfluxDB 存储时序数据
- Redis 缓存热点数据
- 数据库索引优化

### 前端优化
- React Query 数据缓存
- 组件懒加载
- 图片优化

### 监控指标
- 页面加载时间
- API 响应时间
- 数据库查询性能

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 编写单元测试
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Ant Design](https://ant.design/) - UI 组件库
- [Prisma](https://www.prisma.io/) - 数据库 ORM
- [ECharts](https://echarts.apache.org/) - 图表库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

## 📞 支持

如果您遇到问题或有建议，请：

1. 查看 [故障排除](#故障排除) 部分
2. 搜索现有的 [Issues](../../issues)
3. 创建新的 Issue 描述问题
4. 联系项目维护者

---

**Streaming Usage Platform** - 让流媒体使用更透明、更智能 🎬 