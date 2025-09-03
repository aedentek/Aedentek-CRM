import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing database connection...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'undefined');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Database connection successful!');
    await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful!');
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('SQL State:', error.sqlState);
  }
}

testConnection();
