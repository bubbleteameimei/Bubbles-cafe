import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL && !process.env.SUPABASE_POOLER_URL && !process.env.SUPABASE_CONNECTION_POOLER_URL && !process.env.DB_POOLER_URL) {
  throw new Error("DATABASE_URL (or SUPABASE_POOLER_URL) must be set; ensure the database is provisioned");
}

// Normalize protocol and ensure SSL for Supabase
function sanitize(url: string): string {
  let s = url.trim();
  s = s.replace(/^postgresal:\/\//i, "postgresql://");
  s = s.replace(/^postgres:\/\//i, "postgresql://");
  if (!/[?&]sslmode=/i.test(s)) {
    s += (s.includes("?") ? "&" : "?") + "sslmode=require";
  }
  return s;
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: sanitize(
      process.env.SUPABASE_POOLER_URL ||
      process.env.SUPABASE_CONNECTION_POOLER_URL ||
      process.env.DB_POOLER_URL ||
      process.env.DATABASE_URL!
    ),
  },
});
