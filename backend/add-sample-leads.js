import db from './db/config.js';

async function addSampleLeads() {
  try {
    console.log('🔄 Adding sample leads...');
    
    // Sample leads data matching the database schema
    const sampleLeads = [
      {
        date: '2024-12-15',
        name: 'Rajesh Kumar',
        contactNumber: '9876543210',
        reminderDate: '2025-01-15',
        category: 'Real Estate',
        status: 'Active',
        description: 'Interested in 2BHK apartment'
      },
      {
        date: '2024-12-14',
        name: 'Priya Sharma',
        contactNumber: '9765432109',
        reminderDate: '2025-01-10',
        category: 'Insurance',
        status: 'Active',
        description: 'Looking for life insurance'
      },
      {
        date: '2024-12-13',
        name: 'Amit Patel',
        contactNumber: '9654321098',
        reminderDate: '2025-01-20',
        category: 'Education',
        status: 'Active',
        description: 'Wants digital marketing course'
      },
      {
        date: '2024-12-12',
        name: 'Sneha Gupta',
        contactNumber: '9543210987',
        reminderDate: '2025-01-08',
        category: 'Healthcare',
        status: 'Inactive',
        description: 'Not interested in dental services'
      },
      {
        date: '2024-12-11',
        name: 'Vikram Singh',
        contactNumber: '9432109876',
        reminderDate: '2025-01-25',
        category: 'Finance',
        status: 'Active',
        description: 'Considering home loan options'
      },
      {
        date: '2024-12-10',
        name: 'Meera Joshi',
        contactNumber: '9321098765',
        reminderDate: '2025-01-12',
        category: 'Technology',
        status: 'Active',
        description: 'Website development package'
      },
      {
        date: '2024-12-09',
        name: 'Rahul Verma',
        contactNumber: '9210987654',
        reminderDate: '2025-01-18',
        category: 'Automotive',
        status: 'Active',
        description: 'Looking for used car'
      },
      {
        date: '2024-12-08',
        name: 'Kavita Nair',
        contactNumber: '9109876543',
        reminderDate: '2025-01-14',
        category: 'Travel',
        status: 'Active',
        description: 'Kerala tour package inquiry'
      }
    ];

    // Insert leads one by one
    for (const lead of sampleLeads) {
      const query = `
        INSERT INTO leads (date, name, contactNumber, reminderDate, category, status, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        lead.date,
        lead.name,
        lead.contactNumber,
        lead.reminderDate,
        lead.category,
        lead.status,
        lead.description
      ];
      
      await db.execute(query, values);
      console.log(`✅ Added lead: ${lead.name}`);
    }
    
    // Check total count
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM leads');
    console.log(`📊 Total leads in database: ${countResult[0].total}`);
    
    // Show sample data
    const [leads] = await db.execute('SELECT id, name, contactNumber, category, status FROM leads LIMIT 5');
    console.log('📋 Sample leads:');
    leads.forEach(lead => {
      console.log(`  - ${lead.name} (${lead.contactNumber}) - ${lead.category} [${lead.status}]`);
    });
    
    console.log('🎉 Sample leads added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding sample leads:', error.message);
  } finally {
    process.exit(0);
  }
}

addSampleLeads();
