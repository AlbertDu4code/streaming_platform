// src/lib/db/redis.ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

export { redis };

// 缓存使用数据
export async function cacheUsageData(
  key: string,
  data: any,
  ttl: number = 3600 // 1小时
) {
  await redis.setex(key, ttl, JSON.stringify(data));
}

// 获取缓存数据
export async function getCachedData(key: string) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

// 清除缓存
export async function clearCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
