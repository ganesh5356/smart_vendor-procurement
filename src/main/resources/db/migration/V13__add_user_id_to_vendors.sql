DROP PROCEDURE IF EXISTS add_user_id_to_vendors;
DELIMITER //
CREATE PROCEDURE add_user_id_to_vendors()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vendors' AND COLUMN_NAME = 'user_id') THEN
        ALTER TABLE vendors ADD COLUMN user_id BIGINT UNIQUE;
        ALTER TABLE vendors ADD CONSTRAINT fk_vendor_user FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;
END //
DELIMITER ;
CALL add_user_id_to_vendors();
DROP PROCEDURE IF EXISTS add_user_id_to_vendors;
