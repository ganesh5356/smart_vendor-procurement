-- Create table for user (PROCUREMENT / FINANCE) profile update requests
CREATE TABLE IF NOT EXISTS user_profile_update_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    username VARCHAR(100),
    email VARCHAR(150),
    password VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_req_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
