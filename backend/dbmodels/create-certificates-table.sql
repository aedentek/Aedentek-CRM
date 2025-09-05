-- Create Certificates Table for Certificate Management
-- This table stores certificate records similar to medical records

CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    patient_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    certificate_type ENUM('Medical Certificate', 'Fitness Certificate', 'Vaccination Certificate', 'Test Report Certificate', 'Discharge Certificate', 'Other') NOT NULL DEFAULT 'Medical Certificate',
    issued_date DATE NOT NULL,
    valid_until DATE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    doctor_name VARCHAR(255),
    doctor_signature VARCHAR(500), -- Path to doctor signature image
    hospital_stamp VARCHAR(500), -- Path to hospital stamp image
    certificate_template VARCHAR(100) DEFAULT 'standard', -- Template type for certificate layout
    documents JSON, -- Store multiple document paths as JSON array
    status ENUM('Active', 'Expired', 'Revoked', 'Draft') NOT NULL DEFAULT 'Active',
    issued_by VARCHAR(255), -- Staff/Doctor who issued the certificate
    notes TEXT, -- Additional notes or conditions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    
    -- Indexes for better query performance
    INDEX idx_patient_id (patient_id),
    INDEX idx_certificate_number (certificate_number),
    INDEX idx_issued_date (issued_date),
    INDEX idx_status (status),
    INDEX idx_certificate_type (certificate_type),
    INDEX idx_patient_name (patient_name)
);

-- Insert sample certificate data for testing
INSERT INTO certificates (
    certificate_number, 
    patient_id, 
    patient_name, 
    certificate_type, 
    issued_date, 
    valid_until, 
    title, 
    description, 
    doctor_name, 
    status, 
    issued_by, 
    created_by
) VALUES 
(
    'CERT-2024-001', 
    'P001', 
    'John Doe', 
    'Medical Certificate', 
    '2024-12-01', 
    '2024-12-31', 
    'Fitness for Work Certificate', 
    'Patient is medically fit to return to work after recovery from minor illness.', 
    'Dr. Smith Johnson', 
    'Active', 
    'Dr. Smith Johnson', 
    'admin'
),
(
    'CERT-2024-002', 
    'P002', 
    'Jane Smith', 
    'Vaccination Certificate', 
    '2024-11-15', 
    '2025-11-15', 
    'COVID-19 Vaccination Certificate', 
    'Patient has received complete COVID-19 vaccination series as per health guidelines.', 
    'Dr. Emily Wilson', 
    'Active', 
    'Dr. Emily Wilson', 
    'admin'
),
(
    'CERT-2024-003', 
    'P003', 
    'Robert Brown', 
    'Discharge Certificate', 
    '2024-11-20', 
    NULL, 
    'Hospital Discharge Certificate', 
    'Patient has been successfully treated and discharged in stable condition.', 
    'Dr. Michael Davis', 
    'Active', 
    'Dr. Michael Davis', 
    'admin'
);

-- Add a trigger to auto-generate certificate numbers if not provided
DELIMITER $$
CREATE TRIGGER generate_certificate_number 
BEFORE INSERT ON certificates 
FOR EACH ROW 
BEGIN 
    IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
        SET NEW.certificate_number = CONCAT('CERT-', YEAR(CURDATE()), '-', LPAD((
            SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number, -3) AS UNSIGNED)), 0) + 1
            FROM certificates 
            WHERE certificate_number LIKE CONCAT('CERT-', YEAR(CURDATE()), '-%')
        ), 3, '0'));
    END IF;
END$$
DELIMITER ;
