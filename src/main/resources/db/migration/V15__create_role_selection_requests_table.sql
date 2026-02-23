-- Create role_selection_requests table
CREATE TABLE IF NOT EXISTS role_selection_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    requested_role VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,

    -- Vendor-specific fields
    location VARCHAR(150),
    category VARCHAR(100),
    gst_number VARCHAR(50),
    address VARCHAR(255),
    rating DOUBLE,

    additional_details TEXT,

    document_id BIGINT,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_rsr_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_rsr_document FOREIGN KEY (document_id) REFERENCES documents(id)
);
