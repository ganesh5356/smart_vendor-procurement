-- Create documents table (idempotent)
CREATE TABLE IF NOT EXISTS documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    data LONGBLOB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- NOTE: role_selection_requests is created in V15 with document_id already included.
-- No ALTER TABLE needed here.
