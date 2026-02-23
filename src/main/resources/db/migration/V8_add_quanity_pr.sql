DROP PROCEDURE IF EXISTS add_item_amount_json_to_pr;
DELIMITER //
CREATE PROCEDURE add_item_amount_json_to_pr()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_requisitions' AND COLUMN_NAME = 'item_amount_json') THEN
        ALTER TABLE purchase_requisitions ADD COLUMN item_amount_json VARCHAR(1000);
    END IF;
END //
DELIMITER ;
CALL add_item_amount_json_to_pr();
DROP PROCEDURE IF EXISTS add_item_amount_json_to_pr;
