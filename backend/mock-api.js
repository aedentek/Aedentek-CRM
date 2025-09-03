import express from 'express';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

// Mock responses for the CRM frontend
app.get('/api/patients', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'John Doe', phone: '1234567890', date: '2025-09-03' },
      { id: 2, name: 'Jane Smith', phone: '0987654321', date: '2025-09-02' }
    ]
  });
});

app.get('/api/medicine', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Paracetamol', stock: 100, price: 5.50 },
      { id: 2, name: 'Aspirin', stock: 50, price: 8.00 }
    ]
  });
});

app.get('/api/staff', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Dr. Smith', role: 'Doctor', salary: 50000 },
      { id: 2, name: 'Nurse Jane', role: 'Nurse', salary: 30000 }
    ]
  });
});

app.get('/api/doctors', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Dr. Smith', specialization: 'Cardiology', fees: 500 },
      { id: 2, name: 'Dr. Johnson', specialization: 'Neurology', fees: 600 }
    ]
  });
});

// Generic response for all other endpoints
app.use('/api/*', (req, res) => {
  res.json({
    success: true,
    message: 'API endpoint working - database connection pending IP whitelist update',
    data: []
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log('📝 This is a temporary server until IP whitelist is updated');
  console.log('🔧 Add this IP to Hostinger: 2401:4900:8826:6202:5199:4c0a:c591:78a0');
});
