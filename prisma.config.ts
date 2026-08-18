import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Set DATABASE_URL in .env.local once Supabase (or any Postgres) is connected.
    // Falls back to a placeholder so `prisma generate` works before that.
    url: process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/db",
  },
});
