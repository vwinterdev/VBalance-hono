BEGIN;

CREATE TYPE transaction_type AS ENUM ('income', 'expense');

CREATE TABLE IF NOT EXISTS transaction (
    id BIGSERIAL PRIMARY KEY,
    wallet_id BIGINT NOT NULL REFERENCES wallet(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES category(id) ON DELETE RESTRICT,
    balance DECIMAL(15, 2) NOT NULL,
    type transaction_type NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transaction_wallet_id ON transaction(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transaction_category_id ON transaction(category_id);
CREATE INDEX IF NOT EXISTS idx_transaction_created_at ON transaction(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON transaction(type);

CREATE INDEX IF NOT EXISTS idx_transaction_wallet_date 
ON transaction(wallet_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transaction_wallet_type
ON transaction(wallet_id, type);

COMMIT;