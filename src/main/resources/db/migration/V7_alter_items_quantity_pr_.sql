DROP PROCEDURE IF EXISTS add_items_quantity_to_pr;
DELIMITER //
CREATE PROCEDURE add_items_quantity_to_pr()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_requisitions' AND COLUMN_NAME = 'items_json') THEN
        ALTER TABLE purchase_requisitions ADD COLUMN items_json VARCHAR(1000);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_requisitions' AND COLUMN_NAME = 'quantity_json') THEN
        ALTER TABLE purchase_requisitions ADD COLUMN quantity_json VARCHAR(1000);
    END IF;
END //
DELIMITER ;
CALL add_items_quantity_to_pr();
DROP PROCEDURE IF EXISTS add_items_quantity_to_pr;
