# Self-hosting and restoring the wall

Everything needed to run WarmFuzzyWall on your own server and load the recovered notes back into it.

The original deployment was Replit + a Replit-provisioned Neon Postgres. The code is stock Express + Drizzle + React, so it runs anywhere Node 20+ and Postgres 14+ exist. No Replit dependency remains except the dev-only Vite plugins.

---

## What changed to make self-hosting work

Two code changes were required. Both are committed.

### 1. `server/db.ts` — dropped the Neon-only driver

The original used `@neondatabase/serverless`, which talks to Postgres over WebSockets. That driver assumes a serverless proxy and will not connect to a normal Postgres over TCP.

Replaced with the standard `node-postgres` driver:

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

Works against local Postgres, Docker, Neon, Supabase, RDS — anything speaking the Postgres protocol.

### 2. `server/routes.ts` — fixed an unreachable export endpoint

`GET /api/notes/:id` was registered before `GET /api/notes/export`. Express matches in declaration order, so the literal path `/api/notes/export` was captured by `:id` and rejected with `400 Invalid note ID`.

**This means the Export button never worked.** It is the single reason no JSON backup was ever downloaded to your browser — the browser would have received a 400. This bug is worth calling out because it is the reason the data had no escape hatch.

Fixed by constraining the param to digits:

```ts
app.get("/api/notes/:id(\\d+)", ...)
```

Now `/api/notes/export` resolves correctly.

---

## Prerequisites

- Node.js 20 or newer
- PostgreSQL 14 or newer
- A place to run the process (systemd, Docker, pm2, whatever)

---

## 1. Create the database

```bash
sudo -u postgres psql -c "CREATE USER wfw WITH PASSWORD 'choose-a-real-password';"
sudo -u postgres psql -c "CREATE DATABASE warmfuzzywall OWNER wfw;"
```

Then apply the schema:

```bash
psql "postgresql://wfw:choose-a-real-password@127.0.0.1:5432/warmfuzzywall" -f schema.sql
```

`schema.sql` is a hand-written equivalent of `shared/schema.ts` so you do not need `drizzle-kit` for a fresh install.

Alternatively, `npm run db:push` works too, but it needs `DATABASE_URL` set and drizzle-kit installed.

---

## 2. Configure and build

```bash
git clone https://github.com/micahp/WarmFuzzyWall.git
cd WarmFuzzyWall
npm install

export DATABASE_URL="postgresql://wfw:choose-a-real-password@127.0.0.1:5432/warmfuzzywall"
npm run build
```

`npm run build` produces `dist/public/` (the React app) and `dist/index.js` (the server).

---

## 3. Run it

```bash
DATABASE_URL="postgresql://..." NODE_ENV=production npm start
```

Listens on `PORT` (default 5000). Put nginx or Caddy in front for TLS.

A minimal systemd unit:

```ini
[Unit]
Description=WarmFuzzyWall
After=network.target postgresql.service

[Service]
Type=simple
WorkingDirectory=/opt/WarmFuzzyWall
Environment=DATABASE_URL=postgresql://wfw:password@127.0.0.1:5432/warmfuzzywall
Environment=NODE_ENV=production
Environment=PORT=5000
ExecStart=/usr/bin/node dist/index.js
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

---

## 4. Restore the recovered notes

`recovered/import_payload.json` is ready to POST directly at the app's own import endpoint.

```bash
python3 recovered/build_import.py        # regenerate from notes.json if needed
curl -X POST http://localhost:5000/api/notes/import \
  -H "Content-Type: application/json" \
  -d @recovered/import_payload.json
```

Expected response:

```json
{"success":true,"message":"Imported 17 notes successfully"}
```

### What the payload does

- `"clearExisting": true` — wipes the table first, so re-running is idempotent. The import endpoint calls `storage.clearAllNotes()` before inserting. **Only use this against an empty or recovered-only database.** If real notes exist, set it to `false` and you'll get duplicates instead.
- Each note carries an explicit `createdAt`, which the import endpoint preserves (verified: the Drizzle type omits the field but passes it through at runtime).
- `build_import.py` resolves the display dates ("Apr 23", "May 2") to real timestamps on 2025-04-23 through 2025-05-09 and spaces same-day notes one hour apart so the wall's newest-first sort reproduces the original layout.

### Timestamps are approximate within a day

The recovered evidence records only calendar dates, not times. Notes from the same day are spaced an hour apart in wall order — chosen so the visual layout matches. These are **not** the true submission times. If exact times matter, the real values are gone; there's nothing left to recover them from.

---

## 5. Verify

```bash
curl -s http://localhost:5000/api/notes | jq '.totalCount'
# 17

curl -s "http://localhost:5000/api/notes?page=2&limit=12" | jq '.notes[].author'
```

You should see 12 notes on page 1 and 5 on page 2, newest first: Geo (May 9) at the top, Sarang (Apr 23) at the bottom.

---

## Backups

Now that export works, take a dump before you trust the wall again:

```bash
pg_dump "$DATABASE_URL" > warmfuzzywall-$(date +%F).sql
```

And the app-level JSON export:

```bash
curl -s http://localhost:5000/api/notes/export > notes-export-$(date +%F).json
```

Set one of these on a cron. The reason this data died is that no backup existed and the export endpoint was broken — both are fixable.

---

## Testing notes

The restore path was verified end to end against Postgres 16 on this machine:

- schema applied to a fresh database with no errors
- `POST /api/notes/import` returned 17 notes imported
- all 17 rows present with correct author, color, and timestamp
- `GET /api/notes` paginates 12 + 5 with `hasMore` correct
- `GET /api/notes/export` round-trips byte-identical to the import payload (0 field mismatches)
- `GET /api/notes/6` still resolves a single note after the route fix
- emoji intact through the full cycle, including the four header emoji on Hope's note and JD's trailing `A`
- `npm run build` completes clean
