BEGIN;

ALTER TABLE transaction 
ADD COLUMN IF NOT EXISTS wallet_id BIGINT;

UPDATE transaction
SET wallet_id = (
    SELECT c.wallet_id 
    FROM category c
    WHERE c.id = transaction.category_id
)
WHERE wallet_id IS NULL;

ALTER TABLE transaction 
ALTER COLUMN wallet_id SET NOT NULL;

ALTER TABLE transaction
ADD CONSTRAINT fk_transaction_wallet_id 
FOREIGN KEY (wallet_id) REFERENCES wallet(id) ON DELETE CASCADE;

ALTER TABLE transaction
DROP CONSTRAINT IF EXISTS fk_transaction_user_id;

ALTER TABLE transaction 
DROP COLUMN IF EXISTS user_id;

DROP INDEX IF EXISTS idx_transaction_user_id;
DROP INDEX IF EXISTS idx_transaction_user_date;
DROP INDEX IF EXISTS idx_transaction_user_type;

CREATE INDEX IF NOT EXISTS idx_transaction_wallet_id ON transaction(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transaction_wallet_date 
ON transaction(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_wallet_type
ON transaction(wallet_id, type);

COMMIT;
