#!/bin/sh

echo "🚀 开始Railway部署启动流程..."

# 检查数据库连接
echo "📡 检查数据库连接..."
until npx prisma db seed --preview-feature 2>/dev/null || true; do
    echo "⏳ 等待数据库连接..."
    sleep 5
done

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