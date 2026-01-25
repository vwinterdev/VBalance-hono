BEGIN;

CREATE OR REPLACE FUNCTION update_wallet_balance_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'income' THEN
        UPDATE wallet
        SET balance = balance + NEW.balance
        WHERE id = NEW.wallet_id;
    ELSE
        UPDATE wallet
        SET balance = balance - NEW.balance
        WHERE id = NEW.wallet_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_wallet_balance_on_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.type = 'income' THEN
        UPDATE wallet
        SET balance = balance - OLD.balance
        WHERE id = OLD.wallet_id;
    ELSE
        UPDATE wallet
        SET balance = balance + OLD.balance
        WHERE id = OLD.wallet_id;
    END IF;

    IF NEW.type = 'income' THEN
        UPDATE wallet
        SET balance = balance + NEW.balance
        WHERE id = NEW.wallet_id;
    ELSE
        UPDATE wallet
        SET balance = balance - NEW.balance
        WHERE id = NEW.wallet_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_wallet_balance_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.type = 'income' THEN
        UPDATE wallet
        SET balance = balance - OLD.balance
        WHERE id = OLD.wallet_id;
    ELSE
        UPDATE wallet
        SET balance = balance + OLD.balance
        WHERE id = OLD.wallet_id;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_transaction_insert
AFTER INSERT ON transaction
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance_on_insert();

CREATE TRIGGER trigger_transaction_update
AFTER UPDATE ON transaction
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance_on_update();

CREATE TRIGGER trigger_transaction_delete
AFTER DELETE ON transaction
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance_on_delete();

COMMIT;
