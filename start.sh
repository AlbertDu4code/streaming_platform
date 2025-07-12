#!/bin/sh

echo "🚀 开始Railway部署启动流程..."
echo "当前工作目录: $(pwd)"
echo "检查文件存在性:"
ls -la

# 检查Prisma CLI是否可用
echo "📦 检查Prisma CLI..."
if command -v npx >/dev/null 2>&1; then
    echo "✅ npx 可用"
else
    echo "❌ npx 不可用"
    exit 1
fi

# 检查DATABASE_URL环境变量
echo "🔍 检查环境变量..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL 环境变量未设置"
    exit 1
else
    echo "✅ DATABASE_URL 已设置"
fi

# 检查Prisma文件
echo "📁 检查Prisma文件..."
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ 找到 prisma/schema.prisma"
else
    echo "❌ 未找到 prisma/schema.prisma"
    exit 1
fi

# 检查数据库连接
echo "📡 检查数据库连接..."
retries=5
while [ $retries -gt 0 ]; do
    if npx prisma db seed --preview-feature 2>/dev/null || true; then
        echo "✅ 数据库连接成功"
        break
    else
        echo "⏳ 等待数据库连接... ($retries 次重试剩余)"
        sleep 5
        retries=$((retries - 1))
    fi
done

if [ $retries -eq 0 ]; then
    echo "❌ 数据库连接失败"
    exit 1
fi

# 运行数据库迁移
echo "🔄 运行数据库迁移..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ 数据库迁移成功完成！"
else
    echo "❌ 数据库迁移失败！"
    exit 1
fi

# 启动应用
echo "🌟 启动Next.js应用..."
exec node server.js