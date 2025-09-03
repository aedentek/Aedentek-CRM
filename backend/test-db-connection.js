import 'dotenv/config';
import mysql from 'mysql2/promise';

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('Host:', process.env.DB_HOST);
        console.log('User:', process.env.DB_USER);
        console.log('Database:', process.env.DB_NAME);
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'srv1639.hstgr.io',
            user: process.env.DB_USER || 'u745362362_crmusername',
            password: process.env.DB_PASSWORD || 'Aedentek@123#',
            database: process.env.DB_NAME || 'u745362362_crm',
            connectTimeout: 10000
        });
        
        console.log('✅ Database connection successful!');
        
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Query test successful:', rows);
        
        await connection.end();
        console.log('✅ Connection closed successfully');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Error code:', error.code);
    }
}

testConnection();
