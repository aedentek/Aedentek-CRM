// Quick script to add September 2025 test leads
const API_BASE_URL = 'http://localhost:4000/api';

const testLeads = [
  {
    date: '2025-09-01',
    name: 'Rajesh Sharma',
    contactNumber: '+91 98765 43210',
    reminderDate: '2025-09-10',
    category: 'Healthcare',
    status: 'Active',
    description: 'Interested in dental services'
  },
  {
    date: '2025-09-02',
    name: 'Priya Patel',
    contactNumber: '+91 87654 32109',
    reminderDate: '2025-09-15',
    category: 'Consultation',
    status: 'Active',
    description: 'General health checkup inquiry'
  },
  {
    date: '2025-09-03',
    name: 'Amit Kumar',
    contactNumber: '+91 76543 21098',
    reminderDate: '2025-09-20',
    category: 'Emergency',
    status: 'Active',
    description: 'Urgent medical consultation needed'
  },
  {
    date: '2025-09-04',
    name: 'Sunita Gupta',
    contactNumber: '+91 65432 10987',
    reminderDate: '2025-09-25',
    category: 'Routine',
    status: 'Active',
    description: 'Regular health monitoring'
  }
];

async function addTestLeads() {
  console.log('🚀 Adding test leads for September 2025...');
  
  for (let i = 0; i < testLeads.length; i++) {
    const lead = testLeads[i];
    try {
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lead)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Added lead: ${lead.name} (ID: ${result.id})`);
      } else {
        console.log(`❌ Failed to add lead: ${lead.name}`);
      }
    } catch (error) {
      console.error(`❌ Error adding lead ${lead.name}:`, error);
    }
  }
  
  console.log('🎉 Test leads addition completed!');
}

// Run if in browser console or node environment
if (typeof window !== 'undefined') {
  // Browser environment
  addTestLeads();
} else {
  // Node environment
  console.log('Copy and paste this script in browser console when dashboard is open');
}
