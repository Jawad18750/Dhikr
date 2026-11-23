-- The tafsirs, folded for search (scripts/index-tafsir.mjs fills it from the apps' files).
-- Only the folded text is kept: results are shown from the files themselves.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS tafsir_passages (
  tafsir TEXT NOT NULL,
  surah SMALLINT NOT NULL,
  hafs SMALLINT NOT NULL,
  folded TEXT NOT NULL,
  PRIMARY KEY (tafsir, surah, hafs)
);

CREATE INDEX IF NOT EXISTS tafsir_passages_folded ON tafsir_passages USING gin (folded gin_trgm_ops);

-- What was indexed, so an unchanged copy is not indexed again.
CREATE TABLE IF NOT EXISTS search_sources (
  name TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);
