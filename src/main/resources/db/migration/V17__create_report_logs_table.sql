-- Create report_logs table
CREATE TABLE IF NOT EXISTS report_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_type VARCHAR(50),   -- e.g. VENDOR_REPORT, PO_REPORT
    status VARCHAR(20),        -- PENDING, SUCCESS, FAILED
    generated_at TIMESTAMP NULL,
    retry_count INT DEFAULT 0,
    error_message TEXT
);
