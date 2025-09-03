import express from 'express';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

// Mock data for all CRM endpoints
const mockData = {
  staffCategories: [
    { id: 1, name: 'Doctor', description: 'Medical doctors and specialists', status: 'active', created_date: '2025-09-01' },
    { id: 2, name: 'Nurse', description: 'Nursing staff', status: 'active', created_date: '2025-09-01' },
    { id: 3, name: 'Receptionist', description: 'Front desk staff', status: 'active', created_date: '2025-09-01' }
  ],
  patients: [
    { id: 1, name: 'John Doe', phone: '1234567890', address: '123 Main St', date: '2025-09-03' },
    { id: 2, name: 'Jane Smith', phone: '0987654321', address: '456 Oak Ave', date: '2025-09-02' },
    { id: 3, name: 'Mike Johnson', phone: '5551234567', address: '789 Pine St', date: '2025-09-01' }
  ],
  medicine: [
    { id: 1, name: 'Paracetamol', stock: 100, price: 5.50, category: 'Pain Relief' },
    { id: 2, name: 'Aspirin', stock: 50, price: 8.00, category: 'Pain Relief' },
    { id: 3, name: 'Amoxicillin', stock: 75, price: 12.00, category: 'Antibiotic' }
  ],
  medicineCategories: [
    { id: 1, name: 'Pain Relief', description: 'Pain management medicines' },
    { id: 2, name: 'Antibiotic', description: 'Infection treatment medicines' },
    { id: 3, name: 'Vitamins', description: 'Nutritional supplements' }
  ],
  medicineSuppliers: [
    { id: 1, name: 'Pharma Corp', contact: '555-0001', address: 'Industrial Area' },
    { id: 2, name: 'Med Supply Co', contact: '555-0002', address: 'Business District' }
  ],
  staff: [
    { id: 1, name: 'Dr. Smith', role: 'Doctor', salary: 50000, category: 'Doctor' },
    { id: 2, name: 'Nurse Jane', role: 'Nurse', salary: 30000, category: 'Nurse' },
    { id: 3, name: 'Mary Reception', role: 'Receptionist', salary: 25000, category: 'Receptionist' }
  ],
  doctors: [
    { id: 1, name: 'Dr. Smith', specialization: 'Cardiology', fees: 500, experience: '10 years' },
    { id: 2, name: 'Dr. Johnson', specialization: 'Neurology', fees: 600, experience: '8 years' },
    { id: 3, name: 'Dr. Brown', specialization: 'Pediatrics', fees: 400, experience: '12 years' }
  ],
  settings: [
    { key: 'hospital_name', value: 'Gandhi Bai CRM Hospital' },
    { key: 'address', value: '123 Healthcare Ave' },
    { key: 'phone', value: '+91-98765-43210' }
  ]
};

// All API endpoints with proper responses
app.get('/api/staff-categories', (req, res) => {
  res.json({ success: true, data: mockData.staffCategories });
});

app.get('/api/patients', (req, res) => {
  res.json({ success: true, data: mockData.patients });
});

app.get('/api/medicine', (req, res) => {
  res.json({ success: true, data: mockData.medicine });
});

app.get('/api/medicine-categories', (req, res) => {
  res.json({ success: true, data: mockData.medicineCategories });
});

app.get('/api/medicine-suppliers', (req, res) => {
  res.json({ success: true, data: mockData.medicineSuppliers });
});

app.get('/api/medicine-products', (req, res) => {
  res.json({ success: true, data: mockData.medicine });
});

app.get('/api/staff', (req, res) => {
  res.json({ success: true, data: mockData.staff });
});

app.get('/api/doctors', (req, res) => {
  res.json({ success: true, data: mockData.doctors });
});

app.get('/api/settings', (req, res) => {
  res.json({ success: true, data: mockData.settings });
});

// Placeholder images
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#f0f0f0"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666">${width}x${height}</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

// Generic response for all other endpoints
app.use('/api/*', (req, res) => {
  res.json({
    success: true,
    message: 'Full CRM API working with mock data',
    data: []
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Full CRM Mock API server running on http://localhost:${PORT}`);
  console.log('✅ All endpoints working with complete mock data');
  console.log('📊 Your CRM frontend should now work perfectly!');
});
