import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// MySQL connection config using environment variables
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Reduced for stability
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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