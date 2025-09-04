const config = require('./db/config.js');
const mysql = require('mysql2/promise');

async function addSampleLeads() {
  try {
    const pool = mysql.createPool(config.database);
    
    // First update the status enum
    await pool.execute("ALTER TABLE leads MODIFY COLUMN status ENUM('Closed', 'Reminder', 'Not Interested') DEFAULT 'Closed'");
    console.log('✅ Updated leads status enum');
    
    // Insert sample lead categories
    const categoryQuery = 'INSERT IGNORE INTO lead_categories (name, description, createdAt) VALUES ?';
    const categories = [
      ['Real Estate', 'Property buying and selling leads', new Date()],
      ['Insurance', 'Life and health insurance prospects', new Date()],
      ['Education', 'Training and coaching inquiries', new Date()],
      ['Healthcare', 'Medical services and consultations', new Date()],
      ['Finance', 'Loan and investment opportunities', new Date()],
      ['Technology', 'Software and IT service leads', new Date()],
      ['Automotive', 'Car sales and service leads', new Date()],
      ['Travel', 'Tour and travel package inquiries', new Date()]
    ];
    
    await pool.execute(categoryQuery, [categories]);
    console.log('✅ Added lead categories');
    
    // Insert sample leads
    const leadsQuery = 'INSERT IGNORE INTO leads (date, name, contactNumber, reminderDate, category, status, description) VALUES ?';
    const leads = [
      ['2024-12-15', 'Rajesh Kumar', '9876543210', '2025-01-15', 'Real Estate', 'Reminder', 'Interested in 2BHK apartment in Mumbai'],
      ['2024-12-14', 'Priya Sharma', '9765432109', '2025-01-10', 'Insurance', 'Closed', 'Successfully sold life insurance policy'],
      ['2024-12-13', 'Amit Patel', '9654321098', '2025-01-20', 'Education', 'Reminder', 'Wants to join digital marketing course'],
      ['2024-12-12', 'Sneha Gupta', '9543210987', '2025-01-08', 'Healthcare', 'Not Interested', 'Not interested in our dental services'],
      ['2024-12-11', 'Vikram Singh', '9432109876', '2025-01-25', 'Finance', 'Reminder', 'Considering home loan options'],
      ['2024-12-10', 'Meera Joshi', '9321098765', '2025-01-12', 'Technology', 'Closed', 'Purchased website development package'],
      ['2024-12-09', 'Rahul Verma', '9210987654', '2025-01-18', 'Automotive', 'Reminder', 'Looking for used car under 5 lakhs'],
      ['2024-12-08', 'Kavita Nair', '9109876543', '2025-01-14', 'Travel', 'Closed', 'Booked Kerala tour package'],
      ['2024-12-07', 'Suresh Reddy', '9098765432', '2025-01-22', 'Real Estate', 'Reminder', 'Wants commercial space in Bangalore'],
      ['2024-12-06', 'Pooja Mishra', '8987654321', '2025-01-16', 'Insurance', 'Not Interested', 'Already has insurance coverage'],
      ['2024-12-05', 'Deepak Agarwal', '8876543210', '2025-01-30', 'Education', 'Reminder', 'Interested in MBA coaching classes'],
      ['2024-12-04', 'Anjali Kapoor', '8765432109', '2025-01-11', 'Healthcare', 'Closed', 'Completed dental treatment successfully'],
      ['2024-12-03', 'Manoj Yadav', '8654321098', '2025-01-28', 'Finance', 'Reminder', 'Needs personal loan for business'],
      ['2024-12-02', 'Ritu Bansal', '8543210987', '2025-01-13', 'Technology', 'Not Interested', 'Budget constraints for software'],
      ['2024-12-01', 'Kiran Thakur', '8432109876', '2025-01-26', 'Automotive', 'Reminder', 'Interested in car insurance renewal']
    ];
    
    await pool.execute(leadsQuery, [leads]);
    console.log('✅ Added 15 sample leads');
    
    // Check the count
    const [countResult] = await pool.execute('SELECT COUNT(*) as total_leads FROM leads');
    console.log(`📊 Total leads in database: ${countResult[0].total_leads}`);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error adding sample leads:', error.message);
  }
}

addSampleLeads();
