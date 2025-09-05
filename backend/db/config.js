import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// MySQL connection config using environment variables with fallback to hardcoded values
const dbConfig = {
  host: process.env.DB_HOST || 'srv1639.hstgr.io',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'u745362362_crmusername',
  password: process.env.DB_PASSWORD || 'Aedentek@123#',
  database: process.env.DB_NAME || 'u745362362_crm',
  waitForConnections: true,
  connectionLimit: 3, // Reduced for better stability on shared hosting
  queueLimit: 0,
  ssl: { rejectUnauthorized: false },
  // Optimized timeouts for production
  connectTimeout: 20000, // 20 seconds for initial connection
  idleTimeout: 60000, // 1 minute idle timeout
  // Keep connection alive settings
  enableKeepAlive: true,
  keepAliveInitialDelay: 5000, // 5 seconds
  // Additional options for shared hosting
  acquireTimeout: 20000,
  multipleStatements: false
};

console.log('🔌 Database configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password ? '***HIDDEN***' : 'NOT SET',
  database: dbConfig.database,
  connectionLimit: dbConfig.connectionLimit
});

let db;

try {
  db = await mysql.createPool(dbConfig);
  console.log('✅ Database pool created successfully');
  
  // Test connection
  const connection = await db.getConnection();
  await connection.ping();
  connection.release();
  console.log('✅ Database connection test successful');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  
  // Create a fallback pool with even more conservative settings
  db = await mysql.createPool({
    ...dbConfig,
    connectionLimit: 1,
    connectTimeout: 30000
  });
  console.log('⚠️ Created fallback database pool with conservative settings');
}

export default db;