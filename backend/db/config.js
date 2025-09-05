import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// MySQL connection config using environment variables with fallback to hardcoded values
const dbConfig = {
  host: process.env.DB_HOST || 'srv1639.hstgr.io',
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER || 'u745362362_crmusername',
  password: process.env.DB_PASSWORD || 'Aedentek@123#',
  database: process.env.DB_NAME || 'u745362362_crm',
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false },
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
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