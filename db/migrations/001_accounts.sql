-- Accounts (Auth.js, @auth/pg-adapter's own schema), personal API keys, and the usage
-- the site keeps to know what is used: API calls and bulk downloads, per account.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email ON users (lower(email));

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS accounts_provider ON accounts (provider, "providerAccountId");

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS sessions_token ON sessions ("sessionToken");

CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- A key is shown once; only its SHA-256 is kept, and its first characters to tell keys apart.
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS api_keys_user ON api_keys ("userId");

CREATE TABLE IF NOT EXISTS api_requests (
  id BIGSERIAL PRIMARY KEY,
  key_id INTEGER REFERENCES api_keys(id) ON DELETE SET NULL,
  "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  path TEXT NOT NULL,
  status INTEGER NOT NULL,
  bytes INTEGER,
  ms INTEGER,
  country TEXT
);
CREATE INDEX IF NOT EXISTS api_requests_at ON api_requests (at);
CREATE INDEX IF NOT EXISTS api_requests_user_at ON api_requests ("userId", at);

CREATE TABLE IF NOT EXISTS downloads (
  id BIGSERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  slug TEXT NOT NULL,
  kind TEXT NOT NULL,
  surahs INTEGER NOT NULL,
  bytes BIGINT,
  country TEXT
);
CREATE INDEX IF NOT EXISTS downloads_at ON downloads (at);
