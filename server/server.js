import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = process.env.PORT || 4000;

console.log(`🚀 Starting Gandhi Bai CRM Server on port ${PORT}`);
console.log(`📅 Server started at: ${new Date().toISOString()}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint for Render
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Gandhi Bai Healthcare CRM API is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Gandhi Bai Healthcare CRM API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Database connection
const db = mysql.createPool({
  host: 'srv1639.hstgr.io',
  user: 'u745362362_crmusername',
  password: 'Aedentek@123#',
  database: 'u745362362_crm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Simple server startup function
async function startServer() {
  try {
    // Test database connection
    console.log('🔗 Testing database connection...');
    const connection = await db.getConnection();
    console.log('✅ Database connection successful');
    connection.release();

    // Start server - bind to all interfaces for Render deployment
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Gandhi Bai Healthcare CRM Server is running!`);
      console.log(`📡 Server URL: http://0.0.0.0:${PORT}`);
      console.log(`� API endpoints are ready`);
      console.log(`💾 Database connection pool established`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⚡ Server ready to accept requests!\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📴 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        db.end();
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    console.error('💡 Make sure database credentials are correct and accessible');
    process.exit(1);
  }
}

// Export for use in index.js
export { app, db, startServer };
