BEGIN;

DROP INDEX IF EXISTS idx_category_user_id;
DROP INDEX IF EXISTS idx_category_user_type;

ALTER TABLE category DROP COLUMN IF EXISTS user_id;

ALTER TABLE category 
ADD COLUMN wallet_id BIGINT NOT NULL REFERENCES wallet(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_category_wallet_id ON category(wallet_id);
CREATE INDEX IF NOT EXISTS idx_category_wallet_type ON category(wallet_id, type);

COMMIT;