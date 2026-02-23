-- Add description column to roles if it doesn't already exist
DROP PROCEDURE IF EXISTS add_description_to_roles;
DELIMITER //
CREATE PROCEDURE add_description_to_roles()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'roles'
          AND COLUMN_NAME = 'description'
    ) THEN
        ALTER TABLE roles ADD COLUMN description VARCHAR(255);
    END IF;
END //
DELIMITER ;
CALL add_description_to_roles();
DROP PROCEDURE IF EXISTS add_description_to_roles;
