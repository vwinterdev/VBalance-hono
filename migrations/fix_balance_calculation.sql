-- ============================================
-- Исправление баланса и триггера
-- ============================================

-- 1. Удаляем старый триггер, если он есть
DROP TRIGGER IF EXISTS transaction_balance_trigger ON transaction;
DROP FUNCTION IF EXISTS update_profile_balance();

-- 2. Создаем правильную функцию для обновления баланса
CREATE OR REPLACE FUNCTION update_profile_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- При добавлении транзакции
    UPDATE profile 
    SET balance = balance + (
      CASE 
        WHEN NEW.is_positive = true THEN NEW.balance  -- Положительная транзакция
        ELSE -NEW.balance  -- Отрицательная транзакция (расход)
      END
    )
    WHERE id = NEW.user_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- При удалении транзакции (откатываем изменение)
    UPDATE profile 
    SET balance = balance - (
      CASE 
        WHEN OLD.is_positive = true THEN OLD.balance
        ELSE -OLD.balance
      END
    )
    WHERE id = OLD.user_id;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- При обновлении транзакции (откатываем старое и применяем новое)
    UPDATE profile 
    SET balance = balance 
      - (CASE WHEN OLD.is_positive = true THEN OLD.balance ELSE -OLD.balance END)
      + (CASE WHEN NEW.is_positive = true THEN NEW.balance ELSE -NEW.balance END)
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 3. Создаем триггер
CREATE TRIGGER transaction_balance_trigger
AFTER INSERT OR UPDATE OR DELETE ON transaction
FOR EACH ROW
EXECUTE FUNCTION update_profile_balance();

-- 4. Сбрасываем баланс всех пользователей в 0 перед пересчетом
UPDATE profile SET balance = 0;

-- 5. Пересчитываем баланс для всех существующих транзакций
UPDATE profile p
SET balance = COALESCE((
  SELECT SUM(
    CASE 
      WHEN t.is_positive = true THEN t.balance
      ELSE -t.balance
    END
  )
  FROM transaction t
  WHERE t.user_id = p.id
), 0);

-- 6. Проверяем результат (выполните отдельно для проверки)
-- SELECT 
--   p.id,
--   p.first_name,
--   p.balance as current_balance,
--   COUNT(t.id) as transaction_count,
--   SUM(CASE WHEN t.is_positive = true THEN t.balance ELSE -t.balance END) as calculated_balance
-- FROM profile p
-- LEFT JOIN transaction t ON t.user_id = p.id
-- GROUP BY p.id, p.first_name, p.balance
-- ORDER BY p.first_name;
