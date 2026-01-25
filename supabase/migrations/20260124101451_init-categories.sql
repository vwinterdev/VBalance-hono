BEGIN;

CREATE TYPE category_type AS ENUM ('incomes', 'expenses', 'mixed');

CREATE TABLE IF NOT EXISTS category (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    second_color TEXT NOT NULL,
    type category_type DEFAULT 'expenses',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_category_user_id ON category(user_id);
CREATE INDEX IF NOT EXISTS idx_category_type ON category(type);
CREATE INDEX IF NOT EXISTS idx_category_user_type ON category(user_id, type);

COMMIT;