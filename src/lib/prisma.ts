import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Neon's pulled DATABASE_URL uses `sslmode=require`, which `pg` currently
 * treats as an alias for `verify-full` but warns will stop doing so in a
 * future major version. Spell out `verify-full` explicitly so behavior
 * stays the same and the deprecation warning stops firing.
 */
function withExplicitSslMode(connectionString: string | undefined) {
  if (!connectionString) return connectionString;
  const url = new URL(connectionString);
  if (url.searchParams.get("sslmode") === "require") {
    url.searchParams.set("sslmode", "verify-full");
  }
  return url.toString();
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: withExplicitSslMode(process.env.DATABASE_URL) });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
