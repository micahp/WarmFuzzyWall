-- WarmFuzzyWall schema
-- Minimal, hand-written equivalent of the original Drizzle schema.
-- Apply with:  psql "$DATABASE_URL" -f schema.sql

CREATE TABLE IF NOT EXISTS notes (
  id         serial PRIMARY KEY,
  message    text NOT NULL,
  author     text NOT NULL DEFAULT 'Anonymous',
  recipient  text,
  color      text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

-- The wall sorts newest-first and paginates, so index the sort column.
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes (created_at DESC);
