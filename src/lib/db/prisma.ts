// src/lib/db/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 安全的 Prisma 客户端创建函数
const createPrismaClient = () => {
  try {
    // 检查数据库URL是否存在
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL 环境变量未设置，创建空的 Prisma 客户端");
      // 在构建时或缺少数据库URL时，仍然创建客户端但不尝试连接
      return new PrismaClient({
        datasources: {
          db: {
            url: "mysql://placeholder:placeholder@localhost:3306/placeholder"
          }
        },
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    }

    console.log("创建 Prisma 客户端，DATABASE_URL 已配置");
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      errorFormat: "minimal",
    });
  } catch (error) {
    console.error("Prisma 客户端创建失败:", error);
    // 即使创建失败，也返回一个基本的客户端实例
    return new PrismaClient({
      log: ["error"],
    });
  }
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// 在开发环境中保存到全局变量，避免热重载时重复创建
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// 导出一个安全的连接测试函数
export async function testDatabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown database error";
    console.warn("数据库连接测试失败:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
