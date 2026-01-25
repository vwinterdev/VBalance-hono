BEGIN;

-- Добавляем колонку user_id
ALTER TABLE transaction 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Добавляем foreign key constraint на auth.users
ALTER TABLE transaction
ADD CONSTRAINT fk_transaction_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Заполняем user_id для существующих транзакций
-- Связываем через category -> wallet -> wallet_users
UPDATE transaction
SET user_id = (
    SELECT wu.user_id 
    FROM category c
    JOIN wallet_users wu ON wu.wallet_id = c.wallet_id
    WHERE c.id = transaction.category_id 
    AND wu.role = 'owner'
    LIMIT 1
)
WHERE user_id IS NULL;

-- Если остались транзакции без user_id (нет owner), берем любого пользователя кошелька
UPDATE transaction
SET user_id = (
    SELECT wu.user_id 
    FROM category c
    JOIN wallet_users wu ON wu.wallet_id = c.wallet_id
    WHERE c.id = transaction.category_id 
    LIMIT 1
)
WHERE user_id IS NULL;

-- Делаем колонку NOT NULL
ALTER TABLE transaction 
ALTER COLUMN user_id SET NOT NULL;

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_transaction_user_id ON transaction(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_user_date 
ON transaction(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_user_type
ON transaction(user_id, type);

COMMIT;
