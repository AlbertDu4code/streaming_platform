#!/bin/bash

echo "开始Railway构建过程..."

# 检查必需的环境变量
if [ -z "$DATABASE_URL" ]; then
    echo "警告: DATABASE_URL 环境变量未设置，使用默认值进行构建"
    export DATABASE_URL="mysql://user:password@localhost:3306/database"
fi

# 生成Prisma客户端
echo "生成Prisma客户端..."
npx prisma generate

# 构建应用
echo "构建Next.js应用..."
npm run build

echo "构建完成!" 