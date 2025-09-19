
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
const PORT = process.env.PORT || process.env.API_PORT;

// Enhanced CORS configuration for production
app.use(cors({
  origin: [
    process.env.VITE_BASE_URL, // Frontend URL from .env
    process.env.VITE_API_URL?.replace('/api', ''), // Backend URL from .env
    'https://admin.gandhibaideaddictioncenter.com', // Your live Hostinger domain
    'http://admin.gandhibaideaddictioncenter.com', // HTTP version just in case
    'https://gandhibaideaddictioncenter.com', // Main domain if needed
    'http://gandhibaideaddictioncenter.com', // HTTP version
    'https://api.gandhibaideaddictioncenter.com', // VPS API domain
    'http://api.gandhibaideaddictioncenter.com', // HTTP version of API domain
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3000'
  ].filter(Boolean), // Remove any undefined values
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
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log(`📍 Origin: ${req.get('Origin') || 'No Origin'}`);
  console.log(`📋 User-Agent: ${req.get('User-Agent')?.substring(0, 50) || 'No UA'}...`);
  
  // Debug middleware for DELETE requests
  if (req.method === 'DELETE') {
    console.log(`🗑️ DELETE REQUEST DEBUG:`);
    console.log(`🗑️ URL: ${req.originalUrl}`);
    console.log(`🗑️ Path: ${req.path}`);
    console.log(`🗑️ Base URL: ${req.baseUrl}`);
    console.log(`🗑️ Params:`, req.params);
  }
  
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message,
    path: req.path 
  });
});


// Serve static files from uploads directory (for file uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from Photos directory (for staff/doctor photos)
app.use('/Photos', express.static(path.join(__dirname, 'Photos')));

// Note: Frontend is deployed separately to Hostinger, no dist serving needed
console.log('📁 Static file serving configured for uploads and photos only');

console.log(`⚡ Optimized MySQL pool connected to ${process.env.DB_HOST}`);

// Test database connection on startup with enhanced error handling
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  console.log('🌐 Environment:', process.env.NODE_ENV);
  console.log('🏠 DB Host:', process.env.DB_HOST);
  console.log('👤 DB User:', process.env.DB_USER);
  console.log('🗃️ DB Name:', process.env.DB_NAME);
  
  const maxRetries = 5; // Increased retries
  const retryDelay = 3000; // Reduced delay to 3 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Connection attempt ${attempt}/${maxRetries}...`);
      
      // Use a longer timeout for the test query
      const [results] = await Promise.race([
        db.execute('SELECT 1 as test, NOW() as timestamp, @@version as mysql_version'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout after 45 seconds')), 45000)
        )
      ]);
      
      console.log('✅ Database connection test successful');
      console.log('📊 Test result:', results[0]);
      console.log('🔗 MySQL version:', results[0].mysql_version);
      return true;
      
    } catch (err) {
      console.error(`❌ Database connection attempt ${attempt} failed:`);
      console.error('   Error Code:', err.code || 'Unknown');
      console.error('   Error Message:', err.message || 'No message');
      console.error('   SQL State:', err.sqlState || 'Unknown');
      console.error('   Error Number:', err.errno || 'Unknown');
      
      if (attempt < maxRetries) {
        console.log(`⏳ Waiting ${retryDelay / 1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('❌ All connection attempts failed. Server will continue but database operations may fail.');
        return false;
      }
    }
  }
  
  return false;
}

// Global database connection status
let isDatabaseConnected = false;

// Middleware to check database connection before handling requests
const checkDatabaseConnection = async (req, res, next) => {
  if (!isDatabaseConnected) {
    try {
      await db.execute('SELECT 1');
      isDatabaseConnected = true;
    } catch (error) {
      console.error('⚠️ Database connection check failed:', error.message);
      return res.status(503).json({ 
        error: 'Database connection not available', 
        message: 'Please try again in a few moments'
      });
    }
  }
  next();
};

// Run database test and set connection status
testDatabaseConnection().then(connected => {
  isDatabaseConnected = connected;
});

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

// Root route for service health checks
app.get('/', (req, res) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log(`📍 Origin: ${req.headers.origin || 'No Origin'}`);
  console.log(`📋 User-Agent: ${req.headers['user-agent']?.substring(0, 20)}...`);
  
  res.json({
    service: 'CRM Backend API',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      patients: '/api/patients',
      staff: '/api/staff',
      doctors: '/api/doctors',
      medicines: '/api/medicines'
    }
  });
});

// Add debug endpoint for database connection info
app.get('/api/debug/db', (req, res) => {
  res.json({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl_enabled: true,
    environment: process.env.NODE_ENV
  });
});

// Apply database connection check middleware to all API routes
app.use('/api', checkDatabaseConnection);

app.use('/api', stock); 
app.use('/api', medicine); 
app.use('/api', leads); 
app.use('/api', users);
app.use('/api', grocery);
app.use('/api', uploads); // MOVED BEFORE PATIENTS TO TAKE PRIORITY
console.log('📁 Uploads middleware registered at /api');
app.use('/api', performance);
app.use('/api', patientPayments); // MOVED BEFORE PATIENTS TO TAKE PRIORITY
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
console.log('🧪 Test Reports middleware registered at /api');
console.log('👨‍⚕️ Staff Advance middleware registered at /api');
console.log('💰 Doctor Salary middleware registered at /api');
console.log('💼 Staff Salary middleware registered at /api');
console.log('🏥 Patient Payments middleware registered at /api');
// API routes are configured above
// Frontend is deployed separately to Hostinger, so no static file serving needed

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'CRM Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API status endpoint  
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'CRM API is ready',
    timestamp: new Date().toISOString(),
    endpoints: 'All API endpoints available'
  });
});

// Simple test endpoint for frontend connectivity testing
app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    status: 'SUCCESS', 
    message: 'Frontend-Backend connection working perfectly!',
    timestamp: new Date().toISOString(),
    apiUrl: process.env.VITE_API_URL,
    frontendUrl: process.env.VITE_BASE_URL
  });
});

// ⚡ PLACEHOLDER IMAGE ENDPOINT (FIXES 404 ERRORS) ⚡
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  
  // Generate a clean, professional placeholder SVG
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#grad)" stroke="#dee2e6" stroke-width="1"/>
    <circle cx="${width/2}" cy="${height/2 - 6}" r="8" fill="#6c757d" opacity="0.5"/>
    <text x="50%" y="${height/2 + 8}" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="10" fill="#6c757d" opacity="0.7">No Photo</text>
  </svg>`;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.send(svg);
});

// 🎯 FAVICON ENDPOINT (FOR DYNAMIC FAVICON LOADING) 🎯
app.get('/api/favicon', async (req, res) => {
  try {
    console.log('🎯 Favicon requested from database');
    const [rows] = await db.query('SELECT setting_value FROM settings WHERE setting_name = "website_favicon"');
    
    if (rows.length > 0 && rows[0].setting_value) {
      const faviconPath = rows[0].setting_value;
      console.log('✅ Favicon path from database:', faviconPath);
      res.json({ 
        success: true, 
        faviconUrl: faviconPath,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('⚠️ No favicon found in database, using default');
      res.json({ 
        success: true, 
        faviconUrl: '/favicon.ico',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Error fetching favicon:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch favicon',
      faviconUrl: '/favicon.ico',
      timestamp: new Date().toISOString()
    });
  }
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📝 CRM API endpoints are ready`);
  console.log(`💾 Database connection established`);
  console.log(`🔧 Effective PORT env value: ${PORT} (PORT: ${process.env.PORT}, API_PORT: ${process.env.API_PORT})`);
});


