DROP PROCEDURE IF EXISTS drop_vendor_id_from_po;
DELIMITER //
CREATE PROCEDURE drop_vendor_id_from_po()
BEGIN
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'vendor_id') THEN
        ALTER TABLE purchase_orders DROP COLUMN vendor_id;
    END IF;
END //
DELIMITER ;
CALL drop_vendor_id_from_po();
DROP PROCEDURE IF EXISTS drop_vendor_id_from_po;
