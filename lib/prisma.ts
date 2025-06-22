import { PrismaClient } from "@prisma/client";

/*
  Singleton Prisma Client instance so that we do not create
  connections on every hot-reload while developing with Next.js.
*/
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
