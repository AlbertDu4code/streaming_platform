#!/bin/bash

echo "开始Railway部署后的数据库初始化..."

# 等待数据库服务启动
echo "等待数据库连接..."
sleep 10

# 运行Prisma迁移
echo "运行数据库迁移..."
npx prisma migrate deploy

# 生成Prisma客户端
echo "生成Prisma客户端..."
npx prisma generate

# 检查数据库连接
echo "检查数据库连接..."
npx prisma db seed

echo "数据库初始化完成！" 