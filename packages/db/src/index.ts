/**
 * Database client singleton. Re-uses the connection across hot reloads in dev.
 *
 * Note: the Prisma client is generated from `prisma/schema.prisma` via
 * `pnpm --filter @pd/db generate`. Until generated, the import below resolves to the
 * package's generated types.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "@prisma/client";
