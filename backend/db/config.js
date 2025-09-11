import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// Enhanced MySQL connection config with valid MySQL2 options only
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Connection Pool Settings (Valid for MySQL2)
  waitForConnections: true,
  connectionLimit: 8, // Reduced for stability on Render
  queueLimit: 0,
  // SSL Configuration
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Timeout Settings (Valid for MySQL2)
  connectTimeout: 120000, // 2 minutes for initial connection
  timeout: 120000, // Query timeout
  // Connection Settings
  multipleStatements: false,
  charset: 'utf8mb4',
  // Additional MySQL2 valid options
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true
};

console.log('🔧 Database configuration initialized for:', process.env.DB_HOST);

const db = await mysql.createPool(dbConfig);

export default db;