import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// MySQL connection config using environment variables with fallback to hardcoded values
const db = await mysql.createPool({
  host: process.env.DB_HOST || 'srv1639.hstgr.io',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'u745362362_crmusername',
  password: process.env.DB_PASSWORD || 'Aedentek@123#',
  database: process.env.DB_NAME || 'u745362362_crm',
  waitForConnections: true,
  connectionLimit: 10, // Reduced for stability
  queueLimit: 0,
  ssl: { rejectUnauthorized: false },
  // Increased timeouts for remote database connection
  connectTimeout: 60000, // 60 seconds for initial connection
  acquireTimeout: 60000, // 60 seconds to acquire connection
  timeout: 60000, // 60 seconds for query timeout
  idleTimeout: 300000, // 5 minutes
  // Keep connection alive settings
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000, // 30 seconds
  // Retry configuration
  reconnect: true,
  maxReconnects: 3
});

export default db;