# Миграции базы данных

## Исправление баланса и триггера

### Проблема
1. Отрицательные значения становятся положительными
2. Старые транзакции не учитываются в балансе

### Решение

Выполните файл `fix_balance_calculation.sql` в Supabase SQL Editor:

#### Способ 1: Через Supabase Dashboard
1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Перейдите в ваш проект
3. Откройте SQL Editor (иконка `</>` в левом меню)
4. Создайте новый запрос
5. Скопируйте содержимое файла `fix_balance_calculation.sql`
6. Вставьте и нажмите Run

#### Способ 2: Через psql
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f migrations/fix_balance_calculation.sql
```

### Что делает миграция

1. ✅ Удаляет старый триггер (если есть)
2. ✅ Создает исправленную функцию для обновления баланса
3. ✅ Создает триггер для автоматического обновления при INSERT/UPDATE/DELETE
4. ✅ Сбрасывает баланс всех пользователей в 0
5. ✅ Пересчитывает баланс на основе всех существующих транзакций

### Проверка

После выполнения миграции, выполните этот запрос для проверки:

```sql
SELECT 
  p.id,
  p.first_name,
  p.balance as current_balance,
  COUNT(t.id) as transaction_count,
  SUM(CASE WHEN t.is_positive = true THEN t.balance ELSE -t.balance END) as calculated_balance
FROM profile p
LEFT JOIN transaction t ON t.user_id = p.id
GROUP BY p.id, p.first_name, p.balance
ORDER BY p.first_name;
```

Столбцы `current_balance` и `calculated_balance` должны совпадать!

### Логика работы

- **Положительная транзакция** (`is_positive = true`): баланс увеличивается на `balance`
- **Отрицательная транзакция** (`is_positive = false`): баланс уменьшается на `balance`

Пример:
```
Начальный баланс: 0
+ Доход 1000 (is_positive=true) → Баланс: 1000
- Расход 300 (is_positive=false) → Баланс: 700
+ Доход 500 (is_positive=true) → Баланс: 1200
- Расход 200 (is_positive=false) → Баланс: 1000
```
