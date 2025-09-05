
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from './db/config.js'; // Use shared database connection
import medicine from './routes/medicine.js'; 
import stock from './routes/general-stock.js'; 
import leads from './routes/leads.js';
import users from './routes/users.js';
import grocery from './routes/grocery-categories.js';
import patients from './routes/patients.js';
import staff from './routes/staff.js';
import management from './routes/management.js';
import doctor from './routes/doctor.js';
import general from './routes/general-categories.js';
import settings from './routes/settings.js'; 
import payment from './routes/settlement.js'; 
import roles from './routes/roles.js';
import fees from './routes/Fees.js';
import medicalRecords from './routes/medical-records.js';
import testReports from './routes/test-reports.js';
import certificates from './routes/certificates-simple.js';
import doctorAdvance from './api/doctor-advance.js';
import staffAdvance from './api/staff-advance.js';
import doctorSalary from './api/doctor-salary.js';
import staffSalary from './api/staff-salary.js';
import patientPayments from './api/patient-payments.js';
import performance from './routes/performance.js';
// import uploads from './routes/uploads.js';
import uploads from './routes/uploads.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ quiet: true });
const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 10000;

// Enhanced CORS configuration for production
app.use(cors({
  origin: [
    'https://admin.gandhibaideaddictioncenter.com',
    // 'https://crm.gandhibaideaddictioncenter.com', 
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Enable compression for all responses
app.use(compression({
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if the request includes a cache-control: no-transform directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  }
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enhanced request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`� ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err);
  
  // Send appropriate error response
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    res.status(503).json({ 
      error: 'Database connection error', 
      message: 'Unable to connect to database. Please try again later.',
      path: req.path 
    });
  } else {
    res.status(500).json({ 
      error: 'Internal server error', 
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
      path: req.path 
    });
  }
});


// Serve static files from uploads directory (for file uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from Photos directory (for staff/doctor photos)
app.use('/Photos', express.static(path.join(__dirname, 'Photos')));

// Note: Frontend is deployed separately to Hostinger, no dist serving needed
console.log('📁 Static file serving configured for uploads and photos only');

console.log('⚡ Optimized MySQL pool connected to srv1639.hstgr.io');

// Test database connection on startup with enhanced error handling
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
  console.log('🏠 DB Host:', process.env.DB_HOST || 'srv1639.hstgr.io');
  console.log('👤 DB User:', process.env.DB_USER || 'u745362362_crmusername');
  console.log('🗃️ DB Name:', process.env.DB_NAME || 'u745362362_crm');
  
  try {
    const [results] = await db.execute('SELECT 1 as test, NOW() as timestamp, @@version as mysql_version');
    console.log('✅ Database connection test successful');
    console.log('📊 Test result:', results[0]);
    console.log('🔗 MySQL version:', results[0].mysql_version);
    return true;
  } catch (err) {
    console.error('❌ Database connection test failed:');
    console.error('   Error Code:', err.code || 'Unknown');
    console.error('   Error Message:', err.message || 'No message');
    console.error('   SQL State:', err.sqlState || 'Unknown');
    console.error('   Error Number:', err.errno || 'Unknown');
    console.error('   Stack:', err.stack);
    
    // Try alternative connection test
    console.log('🔄 Trying alternative connection method...');
    try {
      const connection = await db.getConnection();
      console.log('✅ Alternative connection successful');
      connection.release();
      return true;
    } catch (altErr) {
      console.error('❌ Alternative connection also failed:', altErr.message);
      return false;
    }
  }
}

// Run database test
testDatabaseConnection();

// Health check endpoint for debugging
app.get('/api/health', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT 1 as test, NOW() as timestamp');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      test_result: results[0]
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add debug endpoint for database connection info
app.get('/api/debug/db', (req, res) => {
  res.json({
    host: process.env.DB_HOST || 'srv1639.hstgr.io',
    user: process.env.DB_USER || 'u745362362_crmusername',
    database: process.env.DB_NAME || 'u745362362_crm',
    port: process.env.DB_PORT || 3306,
    ssl_enabled: true,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api', stock); 
app.use('/api', medicine); 
app.use('/api', leads); 
app.use('/api', users);
app.use('/api', grocery);
app.use('/api', uploads); // MOVED BEFORE PATIENTS TO TAKE PRIORITY
console.log('📁 Uploads middleware registered at /api');
app.use('/api', performance);
app.use('/api', patients);
app.use('/api', staff);
app.use('/api', management);
app.use('/api', doctor);
app.use('/api', general);
app.use('/api', settings); 
app.use('/api', payment); 
app.use('/api', roles);
app.use('/api', medicalRecords);
app.use('/api', certificates);
app.use('/api', fees);
app.use('/api', testReports);
app.use('/api', doctorAdvance);
app.use('/api', staffAdvance);
app.use('/api', doctorSalary);
app.use('/api', staffSalary);
app.use('/api', patientPayments);
console.log('🧪 Test Reports middleware registered at /api');
console.log('👨‍⚕️ Staff Advance middleware registered at /api');
console.log('💰 Doctor Salary middleware registered at /api');
console.log('💼 Staff Salary middleware registered at /api');
console.log('🏥 Patient Payments middleware registered at /api');
// API routes are configured above
// Frontend is deployed separately to Hostinger, so no static file serving needed

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.query('SELECT 1 as test');
    
    res.status(200).json({ 
      status: 'OK', 
      message: 'CRM Backend is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'Connected'
    });
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// API status endpoint  
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await db.query('SELECT 1 as test');
    
    res.status(200).json({ 
      status: 'OK', 
      message: 'CRM API is ready',
      timestamp: new Date().toISOString(),
      endpoints: 'All API endpoints available',
      database: 'Connected'
    });
  } catch (error) {
    console.error('❌ API health check failed:', error.message);
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'API database connection failed',
      timestamp: new Date().toISOString(),
      endpoints: 'API endpoints may be unavailable',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Simple test endpoint for frontend connectivity testing
app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    status: 'SUCCESS', 
    message: 'Frontend-Backend connection working perfectly!',
    timestamp: new Date().toISOString(),
    apiUrl: 'https://crm-czuu.onrender.com/api',
    frontendUrl: 'https://admin.gandhibaideaddictioncenter.com'
  });
});

// Catch-all for undefined API routes
app.use('/api/*', (req, res) => {
  console.error(`❌ 404 - API route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'API route not found', 
    path: req.path,
    method: req.method,
    message: 'The requested API endpoint does not exist'
  });
});

// Catch-all for any other undefined routes
app.use('*', (req, res) => {
  console.error(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.path,
    method: req.method 
  });
});





// Database tables are pre-created in production environment
// Table creation is disabled to avoid permission errors in hosted environments
console.log('📋 Using existing database tables (table creation skipped for production)');





// Bind server to all interfaces so external checks can detect the service
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📝 CRM API endpoints are ready`);
  
  // Test database connection at startup
  try {
    await db.query('SELECT 1 as test');
    console.log(`💾 Database connection established successfully`);
  } catch (error) {
    console.error(`❌ Database connection failed at startup:`, error.message);
  }
  
  console.log(`🔧 Effective PORT env value: ${PORT} (PORT: ${process.env.PORT}, API_PORT: ${process.env.API_PORT})`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: ${process.env.DB_HOST || 'srv1639.hstgr.io'}`);
});


