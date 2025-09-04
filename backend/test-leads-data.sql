-- Test leads data for September 2025 dashboard testing
-- Insert sample leads with reminder dates in current month

INSERT INTO leads (date, name, contactNumber, reminderDate, category, status, description) VALUES 
('2025-09-01', 'John Smith Healthcare Solutions', '9876543210', '2025-09-10', 'Medical Equipment', 'Reminder', 'Interested in hospital equipment upgrade'),
('2025-09-02', 'Sarah Johnson Pharmaceuticals', '9876543211', '2025-09-12', 'Medicine Supply', 'Reminder', 'Bulk medicine supply inquiry'),
('2025-09-03', 'Medical Center Partnership', '9876543212', '2025-09-15', 'Partnership', 'Active', 'Potential collaboration discussion'),
('2025-09-04', 'Tech Solutions for Healthcare', '9876543213', '2025-09-18', 'Technology', 'Reminder', 'EMR system implementation'),
('2025-08-30', 'Legacy Medical Corp', '9876543214', '2025-09-20', 'Equipment', 'Closed', 'Previous month lead with September reminder'),
('2025-09-04', 'Dr. Patel Clinic Network', '9876543215', '2025-09-22', 'Partnership', 'Reminder', 'Multi-clinic partnership opportunity'),
('2025-09-01', 'Healthcare Investors Group', '9876543216', '2025-09-25', 'Investment', 'Active', 'Funding and expansion discussion'),
('2025-09-03', 'Regional Hospital Chain', '9876543217', '2025-09-28', 'Partnership', 'Reminder', 'Regional expansion opportunity');
