import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// Enhanced MySQL connection config with better error handling
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 8, // Reduced for stability on Render
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Enhanced timeouts for remote database connection
  connectTimeout: 120000, // 2 minutes for initial connection
  acquireTimeout: 120000, // 2 minutes to acquire connection
  idleTimeout: 300000, // 5 minutes idle timeout
  // Keep connection alive settings for remote hosting
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000, // 30 seconds
  // Retry logic
  reconnect: true,
  maxReconnects: 5,
  // Additional stability settings
  multipleStatements: false,
  charset: 'utf8mb4'
};

console.log('🔧 Database configuration initialized for:', process.env.DB_HOST);

const db = await mysql.createPool(dbConfig);

export default db;