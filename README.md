# Streaming Usage Platform

一个现代化的视频直播服务管理平台，提供内容接入、分发网络、大规模分布式实时转码等专业直播服务能力。

## 🚀 核心优势

### 🎥 专业直播服务
- **内容接入**: 支持RTMP、RTS等多种推流协议
- **分发网络**: 全球CDN加速，保障高质量内容分发
- **实时转码**: 大规模分布式转码，支持多码率自适应
- **超低延时**: 毫秒级延时，提供极致直播体验
- **高并发**: 轻松应对百万级并发观看

### 📊 直播监控管理
- **实时监控**: 推流状态、观看人数、带宽使用等关键指标
- **多维度统计**: 支持分区域、分辨率、时间维度的数据分析
- **可视化图表**: 基于ECharts的专业数据可视化
- **告警系统**: 智能监控异常状态，及时预警

### 🌐 多区域支持
- **华东区域**: 主要服务区域
- **华北区域**: 覆盖华北地区
- **华南区域**: 服务华南用户
- **弹性扩展**: 支持更多区域接入

### 🎛 流管理功能
- **推流管理**: 支持多路推流，实时状态监控
- **拉流分发**: 多终端适配，智能码率切换
- **录制回放**: 自动录制，云端存储
- **安全防护**: 防盗链、访问控制、内容审核

## 🛠 技术架构

### 前端技术栈
- **框架**: Next.js 15.3.3 (App Router)
- **UI 库**: React 19 + Ant Design 5.26.2
- **状态管理**: Zustand 5.0.5
- **数据获取**: TanStack React Query 5.80.7
- **表单处理**: React Hook Form 7.58.1 + Zod 3.25.67
- **图表组件**: ECharts 5.6.0
- **动画效果**: Framer Motion 12.18.1

### 后端架构
- **主数据库**: MySQL 8.0 (用户、直播流元数据)
- **时序数据库**: InfluxDB 2.0 (监控数据、统计指标)
- **缓存系统**: Redis 7 (会话、热点数据)
- **ORM**: Prisma 6.10.0
- **认证系统**: NextAuth.js 4.24.11
- **API 服务**: Next.js API Routes

### 基础设施
- **容器化**: Docker + Docker Compose
- **数据库管理**: Adminer 4.8.1
- **监控服务**: 自研监控系统

## 📦 快速部署

### 环境要求
- Node.js 18+ 
- Docker & Docker Compose
- Git

### 1. 克隆项目
```bash
git clone <repository-url>
cd streaming_platform
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

# InfluxDB 配置 (监控数据)
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=my_super_secret_admin_token_123456789
INFLUX_ORG=streaming-org
INFLUX_BUCKET=usage-data

# Redis 配置 (缓存)
REDIS_URL=redis://:redis_pass_123@localhost:6379

# 直播服务配置 (可选)
LIVE_PUSH_DOMAIN=push.example.com
LIVE_PULL_DOMAIN=pull.example.com
LIVE_API_KEY=your_live_api_key
```

### 4. 启动基础服务
```bash
# 一键启动数据库服务
npm run setup-db

# 或手动启动
docker-compose up -d
```

### 5. 数据库初始化
```bash
# 生成 Prisma 客户端
npx prisma generate

# 创建数据库表
npx prisma db push

# 初始化测试数据 (可选)
curl -X POST http://localhost:4000/api/init-data
```

### 6. 启动应用
```bash
npm run dev
```

访问 http://localhost:4000 查看应用。

## 🏗 项目结构

```
streaming_platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 用户认证 API
│   │   │   ├── data/          # 监控数据 API
│   │   │   └── init-data/     # 数据初始化 API
│   │   ├── auth/              # 认证页面
│   │   │   ├── login/         # 登录页面
│   │   │   └── register/      # 注册页面
│   │   ├── monitoring/        # 直播监控面板
│   │   │   └── components/    # 监控组件
│   │   ├── streams/           # 直播流管理 (开发中)
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── lib/                   # 核心库
│   │   ├── auth/              # 认证配置
│   │   ├── db/                # 数据库客户端
│   │   ├── influxdb.ts        # InfluxDB 客户端
│   │   ├── theme.ts           # Ant Design 主题
│   │   └── utils.ts           # 工具函数
│   ├── types/                 # TypeScript 类型
│   └── middleware.ts          # 路由中间件
├── prisma/                    # 数据库配置
│   ├── schema.prisma          # 数据模型定义
│   └── migrations/            # 数据库迁移
├── docker/                    # Docker 配置文件
├── scripts/                   # 脚本工具
├── docker-compose.yml         # 服务编排
└── package.json               # 项目配置
```

## 🗄 数据模型设计

### 核心数据模型

#### User (用户)
```typescript
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### LiveStream (直播流) - 规划中
```typescript
model LiveStream {
  id           String      @id @default(cuid())
  userId       String
  name         String      // 流名称
  streamKey    String      @unique // 推流密钥
  region       String      // 区域 (华东/华北/华南)
  resolution   String      // 分辨率 (720P/1080P/4K)
  bitrate      Int         // 码率 (kbps)
  frameRate    Int         // 帧率 (fps)
  status       StreamStatus // 流状态
  pushUrl      String      // 推流地址
  pullUrl      String      // 拉流地址
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  user User @relation(fields: [userId], references: [id])
}

enum StreamStatus {
  ACTIVE
  INACTIVE
  ERROR
}
```

### 监控数据 (InfluxDB)
- **实时指标**: 推流状态、观看人数、带宽使用
- **历史数据**: 流量统计、用户行为、服务质量
- **告警数据**: 异常事件、性能指标

## 🔌 API 接口

### 认证系统
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/callback/credentials` - 用户登录
- `GET /api/auth/session` - 获取会话信息

### 监控数据
- `GET /api/data` - 获取监控数据
  - 支持查询参数: `metric`, `timeRange`, `region`
  - 返回格式化的图表数据

### 数据管理
- `POST /api/init-data` - 初始化测试数据
- `GET /api/data/streams` - 获取直播流列表 (规划中)
- `POST /api/data/streams` - 创建直播流 (规划中)

## 🎨 功能特性

### 直播监控面板
- **实时概览**: 关键指标卡片展示
- **趋势图表**: 多维度数据可视化
- **区域分析**: 按地域统计服务质量
- **性能监控**: 延时、丢包率等关键指标

### 用户认证系统
- **安全登录**: 基于NextAuth.js的认证机制
- **会话管理**: JWT token + Redis会话存储
- **权限控制**: 基于角色的访问控制

### 响应式设计
- **多端适配**: 支持桌面端、平板、手机
- **现代UI**: 基于Ant Design的专业界面
- **实时更新**: 数据自动刷新，无需手动操作

## 🚀 部署指南

### 开发环境
```bash
# 开发服务器
npm run dev

# 查看应用
open http://localhost:4000
```

### 生产部署
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

### Docker 容器化
```bash
# 构建应用镜像
docker build -t apsara-live-platform .

# 启动完整服务栈
docker-compose up -d

# 查看服务状态
docker-compose ps
```

## 🔧 开发指南

### 添加新的监控指标
1. 在 InfluxDB 中定义新的测量指标
2. 更新 `src/lib/influxdb.ts` 中的查询方法
3. 在监控组件中集成新指标的图表展示

### 扩展直播流管理
1. 完善 Prisma schema 中的 LiveStream 模型
2. 实现流管理相关的 API 接口
3. 开发流管理的前端界面

### 集成直播服务 API
1. 配置直播服务 SDK
2. 实现推拉流地址生成
3. 集成录制、转码等高级功能

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查容器状态
   docker-compose ps
   
   # 重启数据库
   docker-compose restart mysql
   ```

2. **InfluxDB 连接异常**
   ```bash
   # 检查 InfluxDB 状态
   curl http://localhost:8086/health
   
   # 重启 InfluxDB
   docker-compose restart influxdb
   ```

3. **认证失败**
   ```bash
   # 重新生成数据库表
   npx prisma db push
   
   # 检查环境变量
   echo $NEXTAUTH_SECRET
   ```

### 监控与调试
```bash
# 查看应用日志
npm run dev 2>&1 | tee app.log

# 查看容器日志
docker-compose logs -f mysql influxdb redis

# 监控数据库性能
docker exec -it streaming-mysql mysql -u root -p -e "SHOW PROCESSLIST;"
```

## 📊 性能优化

### 数据库优化
- **读写分离**: InfluxDB 处理时序数据，MySQL 处理业务数据
- **索引优化**: 针对查询频繁的字段建立合适索引
- **连接池**: 配置数据库连接池，提高并发性能

### 缓存策略
- **Redis 缓存**: 热点数据、会话信息缓存
- **React Query**: 前端数据缓存和状态管理
- **CDN 缓存**: 静态资源分发优化

### 实时性优化
- **数据流**: 优化数据采集和传输链路
- **查询优化**: 针对时序数据优化查询性能
- **前端优化**: 组件懒加载，减少首屏加载时间

## 🎯 发展路线

### 近期目标 (Q1 2024)
- ✅ 完成用户认证系统
- ✅ 实现基础监控面板
- 🔄 开发直播流管理功能
- 📋 集成直播服务 API

### 中期规划 (Q2-Q3 2024)
- 📋 实现实时录制和回放
- 📋 添加内容审核功能
- 📋 开发移动端应用
- 📋 支持多租户架构

### 长期愿景 (Q4 2024+)
- 📋 AI 智能运营助手
- 📋 全球多云部署
- 📋 开放 API 生态
- 📋 企业级安全认证

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交代码 (`git commit -m '添加某个新功能'`)
4. 推送分支 (`git push origin feature/新功能`)
5. 创建 Pull Request

### 开发规范
- 遵循 TypeScript 严格模式
- 使用 ESLint + Prettier 代码格式化
- 编写清晰的提交信息
- 更新相关文档

## 📄 开源协议

本项目采用 MIT 开源协议 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 技术致谢

- [Next.js](https://nextjs.org/) - 全栈 React 框架
- [Ant Design](https://ant.design/) - 企业级 UI 组件库
- [Prisma](https://www.prisma.io/) - 现代化数据库 ORM
- [InfluxDB](https://www.influxdata.com/) - 时序数据库
- [ECharts](https://echarts.apache.org/) - 数据可视化图表库

## 📞 技术支持

遇到问题或有建议？

1. 📖 查看 [故障排除](#故障排除) 文档
2. 🔍 搜索现有 [Issues](../../issues)
3. 🆕 创建新 Issue 详细描述问题
4. 💬 联系开发团队

---

**Streaming Usage Platform** - 专业可靠的直播技术解决方案 🎥✨ 