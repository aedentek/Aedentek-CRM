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
      host: process.env.DB_HOST || 'srv1639.hstgr.io',
      user: process.env.DB_USER || 'u745362362_crmusername',
      password: process.env.DB_PASSWORD || 'Aedentek@123#',
      database: process.env.DB_NAME || 'u745362362_crm'
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
