import 'dotenv/config';
import mysql from 'mysql2/promise';

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('Host:', process.env.DB_HOST);
        console.log('User:', process.env.DB_USER);
        console.log('Database:', process.env.DB_NAME);
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
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
