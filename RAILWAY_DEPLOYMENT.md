# Railway 部署指南

## 步骤1：创建Railway账户

1. 访问 [Railway.app](https://railway.app)
2. 使用GitHub账户登录
3. 创建新项目

## 步骤2：部署数据库服务

### 2.1 创建MySQL服务
1. 在Railway项目中点击"New Service"
2. 选择"Database" → "MySQL"
3. 服务名称：`mysql-database`
4. 记录生成的连接信息

### 2.2 创建Redis服务
1. 点击"New Service"
2. 选择"Database" → "Redis"
3. 服务名称：`redis-cache`
4. 记录生成的连接信息

### 2.3 创建InfluxDB服务
1. 点击"New Service"
2. 选择"Database" → "InfluxDB"
3. 服务名称：`influxdb-metrics`
4. 记录生成的连接信息

## 步骤3：部署应用服务

### 3.1 连接GitHub仓库
1. 点击"New Service"
2. 选择"GitHub Repo"
3. 选择你的`streaming_platform`仓库
4. 选择main分支

### 3.2 配置环境变量
在应用服务的"Variables"标签页中添加：

```bash
# 数据库连接
DATABASE_URL=${MYSQL_URL}

# NextAuth配置
NEXTAUTH_URL=${RAILWAY_PUBLIC_DOMAIN}
NEXTAUTH_SECRET=your-secret-key-here

# InfluxDB配置
INFLUX_URL=${INFLUXDB_URL}
INFLUX_TOKEN=${INFLUXDB_TOKEN}
INFLUX_ORG=${INFLUXDB_ORG}
INFLUX_BUCKET=${INFLUXDB_BUCKET}

# Redis配置
REDIS_URL=${REDIS_URL}

# 其他配置
NODE_ENV=production
```

### 3.3 配置服务依赖
1. 在应用服务的"Settings"标签页
2. 添加对数据库服务的依赖关系

## 步骤4：配置域名

1. 在应用服务的"Settings"标签页
2. 点击"Generate Domain"或添加自定义域名
3. 记录生成的域名

## 步骤5：初始化数据库

### 5.1 运行Prisma迁移
1. 在Railway控制台中打开应用服务的终端
2. 运行以下命令：
```bash
npx prisma migrate deploy
npx prisma generate
```

### 5.2 初始化InfluxDB
1. 访问InfluxDB管理界面
2. 创建组织：`streaming-org`
3. 创建存储桶：`usage-data`
4. 生成API令牌

## 步骤6：验证部署

1. 访问应用域名
2. 检查健康检查端点：`/api/health`
3. 测试应用功能

## 环境变量参考

### MySQL连接字符串格式
```
mysql://username:password@host:port/database
```

### Redis连接字符串格式
```
redis://:password@host:port
```

### InfluxDB连接信息
- URL: `https://your-influxdb-instance.railway.app`
- Token: 从InfluxDB管理界面获取
- Org: `streaming-org`
- Bucket: `usage-data`

## 故障排除

### 常见问题

1. **构建失败**
   - 检查Dockerfile语法
   - 确认所有依赖都已安装

2. **数据库连接失败**
   - 验证环境变量是否正确
   - 检查数据库服务是否正常运行

3. **健康检查失败**
   - 检查`/api/health`端点是否正常响应
   - 查看应用日志

### 查看日志
1. 在Railway控制台中点击服务
2. 查看"Deployments"标签页的日志
3. 使用"View Logs"功能实时查看日志

## 成本优化

- Railway免费套餐包含：
  - 每月$5的免费额度
  - 512MB RAM
  - 共享CPU
  - 每月500小时运行时间

- 建议：
  - 开发环境使用免费套餐
  - 生产环境升级到付费套餐以获得更好的性能 