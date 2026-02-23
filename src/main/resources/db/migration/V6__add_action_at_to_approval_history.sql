DROP PROCEDURE IF EXISTS add_action_at_to_approval_history;
DELIMITER //
CREATE PROCEDURE add_action_at_to_approval_history()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'approval_history' AND COLUMN_NAME = 'action_at') THEN
        ALTER TABLE approval_history ADD COLUMN action_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END //
DELIMITER ;
CALL add_action_at_to_approval_history();
DROP PROCEDURE IF EXISTS add_action_at_to_approval_history;
