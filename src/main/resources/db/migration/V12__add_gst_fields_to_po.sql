-- Migration: Add CGST, SGST, IGST fields to purchase_orders table (idempotent)
DROP PROCEDURE IF EXISTS update_gst_fields_in_po;
DELIMITER //
CREATE PROCEDURE update_gst_fields_in_po()
BEGIN
    -- Drop legacy columns if they exist
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'gst_percent') THEN
        ALTER TABLE purchase_orders DROP COLUMN gst_percent;
    END IF;
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'gst_amount') THEN
        ALTER TABLE purchase_orders DROP COLUMN gst_amount;
    END IF;
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'cgst_percent') THEN
        ALTER TABLE purchase_orders ADD COLUMN cgst_percent DECIMAL(10, 2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'sgst_percent') THEN
        ALTER TABLE purchase_orders ADD COLUMN sgst_percent DECIMAL(10, 2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'igst_percent') THEN
        ALTER TABLE purchase_orders ADD COLUMN igst_percent DECIMAL(10, 2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'cgst_amount') THEN
        ALTER TABLE purchase_orders ADD COLUMN cgst_amount DECIMAL(15, 2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'sgst_amount') THEN
        ALTER TABLE purchase_orders ADD COLUMN sgst_amount DECIMAL(15, 2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'igst_amount') THEN
        ALTER TABLE purchase_orders ADD COLUMN igst_amount DECIMAL(15, 2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'total_gst_amount') THEN
        ALTER TABLE purchase_orders ADD COLUMN total_gst_amount DECIMAL(15, 2);
    END IF;
END //
DELIMITER ;
CALL update_gst_fields_in_po();
DROP PROCEDURE IF EXISTS update_gst_fields_in_po;
