# Vercel 部署指南

## 环境变量配置

在Vercel项目设置中配置以下环境变量：

### 必需的环境变量

1. **数据库配置**
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

2. **NextAuth配置**
   ```
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-secret-key
   ```

3. **InfluxDB配置**
   ```
   INFLUX_URL=https://your-influxdb-instance
   INFLUX_TOKEN=your-influxdb-token
   INFLUX_ORG=your-org
   INFLUX_BUCKET=streaming_metrics
   ```

4. **Redis配置**
   ```
   REDIS_URL=redis://your-redis-instance
   ```

## 部署步骤

1. **连接GitHub仓库**
   - 在Vercel中导入你的GitHub仓库
   - 选择main分支

2. **配置构建设置**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **设置环境变量**
   - 在项目设置中添加上述环境变量
   - 确保所有变量都已正确配置

4. **部署**
   - 点击"Deploy"按钮
   - 等待构建完成

## 注意事项

- 确保数据库、InfluxDB和Redis服务可以从Vercel访问
- 如果使用外部服务，确保网络连接正常
- 建议使用Vercel的Postgres、Redis等集成服务

## 故障排除

如果部署失败，检查：
1. 环境变量是否正确配置
2. 数据库连接是否正常
3. 依赖项是否正确安装
4. 构建日志中的错误信息 