-- Simplified Certificates Table
-- Only essential fields: name, certificate type, issued date, description, photo

CREATE TABLE IF NOT EXISTS certificates_simple (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    certificate_type VARCHAR(255) NOT NULL, -- Free text field instead of enum
    issued_date DATE NOT NULL,
    description TEXT,
    certificate_photo VARCHAR(500), -- Path to uploaded certificate photo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better query performance
    INDEX idx_patient_name (patient_name),
    INDEX idx_issued_date (issued_date),
    INDEX idx_certificate_type (certificate_type)
);

-- Migrate existing data to simplified table
INSERT INTO certificates_simple (patient_name, certificate_type, issued_date, description)
SELECT patient_name, certificate_type, issued_date, description 
FROM certificates;

-- Drop old table and rename new one
DROP TABLE certificates;
RENAME TABLE certificates_simple TO certificates;
