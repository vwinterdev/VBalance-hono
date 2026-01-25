BEGIN;

ALTER TABLE transaction 
ADD COLUMN IF NOT EXISTS user_id UUID;

UPDATE transaction
SET user_id = (
    SELECT wu.user_id 
    FROM wallet_users wu 
    WHERE wu.wallet_id = transaction.wallet_id 
    AND wu.role = 'owner'
    LIMIT 1
)
WHERE user_id IS NULL;

UPDATE transaction
SET user_id = (
    SELECT wu.user_id 
    FROM wallet_users wu 
    WHERE wu.wallet_id = transaction.wallet_id 
    LIMIT 1
)
WHERE user_id IS NULL;

ALTER TABLE transaction 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE transaction
ADD CONSTRAINT fk_transaction_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_transaction_user_id ON transaction(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_user_date 
ON transaction(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_user_type
ON transaction(user_id, type);

COMMIT;
