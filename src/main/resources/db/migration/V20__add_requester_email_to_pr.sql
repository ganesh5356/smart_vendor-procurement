-- Migration to add requester_email to purchase_requisitions table
DROP PROCEDURE IF EXISTS add_requester_email_to_pr;
DELIMITER //
CREATE PROCEDURE add_requester_email_to_pr()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'purchase_requisitions' 
        AND COLUMN_NAME = 'requester_email'
    ) THEN
        ALTER TABLE purchase_requisitions ADD COLUMN requester_email VARCHAR(150);
    END IF;
END //
DELIMITER ;
CALL add_requester_email_to_pr();
DROP PROCEDURE IF EXISTS add_requester_email_to_pr;
