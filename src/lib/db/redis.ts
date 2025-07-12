// src/lib/db/redis.ts
import Redis from "ioredis";

// 自动为 Railway 私有 Redis 加 family=0，兼容本地和云端
function getRedisUrlWithFamily(url?: string) {
  if (!url) return undefined;
  // 已经有 family 参数
  if (url.includes("family=")) return url;
  // 有其它查询参数
  if (url.includes("?")) return url + "&family=0";
  // 没有查询参数
  return url + "?family=0";
}

const redisUrl = getRedisUrlWithFamily(process.env.REDIS_URL);
export const redis = new Redis(redisUrl!);

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