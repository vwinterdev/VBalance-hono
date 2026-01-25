BEGIN;

CREATE TABLE IF NOT EXISTS wallet (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0,
    currency TEXT DEFAULT 'RUB',
    icon TEXT DEFAULT '💰',
    color TEXT DEFAULT '#4CAF50',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE wallet_role AS ENUM ('owner', 'editor', 'viewer');

CREATE TABLE IF NOT EXISTS wallet_users (
    id BIGSERIAL PRIMARY KEY,
    wallet_id BIGINT NOT NULL REFERENCES wallet(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role wallet_role DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(wallet_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_wallet_users_wallet_id ON wallet_users(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_users_user_id ON wallet_users(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_users_role ON wallet_users(role);

COMMIT;