-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recipient VARCHAR(150),
    subject VARCHAR(255),
    body TEXT,
    status VARCHAR(20),        -- PENDING, SENT, FAILED
    retry_count INT DEFAULT 0,
    last_attempt TIMESTAMP NULL,
    error_message TEXT
);
