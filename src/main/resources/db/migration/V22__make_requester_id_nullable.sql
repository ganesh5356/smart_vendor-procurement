-- The PurchaseRequisition entity does not have a 'requester_id' field.
-- The application uses 'requester_email' instead.
-- This migration makes 'requester_id' nullable to prevent the DB error:
-- "Field 'requester_id' doesn't have a default value"

ALTER TABLE purchase_requisitions
    MODIFY COLUMN requester_id BIGINT NULL;
