# Migrating from Neon Postgres to Supabase

Both Neon and Supabase run standard PostgreSQL. The migration is primarily about moving schema and data, then pointing your app to the new connection string.

## Summary

- Export your existing Neon database (schema + data).
- Create a Supabase project and import the dump.
- Update `DATABASE_URL` in your environment to the Supabase connection string.
- Run your ORM migrations (Drizzle) to reconcile any schema drift.
- Verify tables, sequences, and app behavior, then cut over traffic.

---

## 1) Prepare Supabase

1. Create a new Supabase project.
2. Go to Project Settings → Database and copy the connection string (it looks like):
   ```
   postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
   ```
3. Make sure the SQL editor works and you can connect via psql locally (optional).

---

## 2) Export from Neon (pg_dump)

Use pg_dump to create a portable binary dump (recommended) with ownership/ACL stripped to avoid role conflicts on import.

- Set your Neon database credentials (replace placeholders):
  ```bash
  export PGHOST=ep-xxxxx-pooler.neon.tech   # use the pooled host if applicable
  export PGPORT=5432
  export PGUSER=<neon_user>
  export PGPASSWORD=<neon_password>
  export PGDATABASE=<neon_db>
  ```

- Create a compressed dump (custom format):
  ```bash
  pg_dump -Fc --no-owner --no-privileges -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f backups/neon.dump
  ```

Alternative (human-readable SQL, but slower import):
  ```bash
  pg_dump --no-owner --no-privileges -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" > backups/neon.sql
  ```

---

## 3) Import into Supabase

Set Supabase connection env:
```bash
export SGHOST=db.<PROJECT_REF>.supabase.co
export SGPORT=5432
export SGUSER=postgres
export SGPASSWORD=<supabase_password>
export SGDATABASE=postgres
```

- Recommended: pg_restore from the binary dump
  ```bash
  pg_restore --no-owner --no-privileges -h "$SGHOST" -p "$SGPORT" -U "$SGUSER" -d "$SGDATABASE" -v backups/neon.dump
  ```

- Alternative: psql with the SQL dump
  ```bash
  psql -h "$SGHOST" -p "$SGPORT" -U "$SGUSER" -d "$SGDATABASE" -f backups/neon.sql
  ```

Ensure extensions exist (optional; Supabase supports many):
```sql
-- in Supabase SQL editor or psql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

---

## 4) Point the app to Supabase

- Update your environment (Render/Vercel/Local `.env`) with the Supabase connection string:
  ```
  DATABASE_URL=postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require
  ```

- In this repo:
  - `drizzle.config.ts` reads `DATABASE_URL` → works unchanged.
  - `server/db.ts` and `scripts/connect-db.ts` will connect via `pg` and Drizzle. We’ve removed the Neon fallback and made SSL explicit.

---

## 5) Reconcile schema with Drizzle (optional but recommended)

If you maintain schema with Drizzle:

- Generate migrations (if needed):
  ```bash
  npm run db:generate
  ```

- Push schema to Supabase:
  ```bash
  npm run db:push
  ```

- Or use any custom setup scripts you rely on:
  ```bash
  npx tsx scripts/db-push.ts
  ```

---

## 6) Verify data, sequences, and app behavior

- Check tables:
  ```bash
  psql -h "$SGHOST" -U "$SGUSER" -d "$SGDATABASE" -c "\dt"
  ```

- If you use `SERIAL`/sequences and bulk inserts, verify sequence positions:
  ```sql
  -- Example: fix a sequence if needed
  SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
  ```

- Test the connection:
  ```bash
  npx tsx scripts/test-db-connection.ts
  ```

- Run the app in dev and hit health endpoints:
  ```bash
  npm run dev:server
  curl http://localhost:5000/api/health
  ```

---

## 7) Cutover and cleanup

- Switch production env var `DATABASE_URL` to Supabase on your host (Render, etc.).
- Monitor logs for connection pool behavior and query errors.
- Optionally remove Neon-specific code/dependencies later.

---

## Notes and gotchas

- SSL: Supabase requires TLS. We enable `sslmode=require` and the code sets `ssl: { rejectUnauthorized: false }` for `pg`.
- Roles/ACL: `--no-owner --no-privileges` prevents role conflicts on import.
- Extensions: Enable needed extensions in Supabase (e.g., `uuid-ossp`, `pg_trgm`) if your schema uses them.
- Channel binding: Some Neon URLs include `channel_binding=require` which node-postgres ignores; our connection sanitizer removes it.

---

## Quick checklist

- [ ] Supabase project created; connection string copied
- [ ] Neon dump created (`.dump` recommended)
- [ ] Imported into Supabase via `pg_restore`
- [ ] `DATABASE_URL` updated in all environments
- [ ] Drizzle schema pushed
- [ ] Tables and sequences verified
- [ ] Application tested against Supabase

If you want, we can create a one-shot script that automates export/import given both sets of credentials. Reach out and I’ll add it here.