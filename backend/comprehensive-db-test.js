import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Comprehensive Database Diagnostics');
console.log('=====================================');

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
};

console.log('Configuration:');
console.log('Host:', config.host);
console.log('User:', config.user);
console.log('Database:', config.database);
console.log('Password length:', config.password?.length);
console.log('Password preview:', config.password?.substring(0, 3) + '***');

async function comprehensiveTest() {
  console.log('\n📡 Testing basic connectivity...');
  
  try {
    // Test 1: Basic connection without database
    console.log('\n🔹 Test 1: Connect without selecting database');
    const connectionWithoutDB = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port
    });
    console.log('✅ Basic connection successful!');
    
    // Test 2: Show databases
    console.log('\n🔹 Test 2: List available databases');
    const [databases] = await connectionWithoutDB.execute('SHOW DATABASES');
    console.log('Available databases:', databases.map(db => db.Database));
    
    // Test 3: Check user privileges
    console.log('\n🔹 Test 3: Check user privileges');
    const [privileges] = await connectionWithoutDB.execute('SHOW GRANTS');
    console.log('User privileges:', privileges);
    
    await connectionWithoutDB.end();
    
    // Test 4: Connect with specific database
    console.log('\n🔹 Test 4: Connect to specific database');
    const connectionWithDB = await mysql.createConnection(config);
    console.log('✅ Database-specific connection successful!');
    
    const [result] = await connectionWithDB.execute('SELECT 1 as test, NOW() as time');
    console.log('✅ Query test successful:', result[0]);
    
    await connectionWithDB.end();
    
  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error('Error code:', error.code);
    console.error('Error number:', error.errno);
    console.error('SQL State:', error.sqlState);
    console.error('Message:', error.message);
    
    // Additional diagnostics
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Verify database user exists in Hostinger control panel');
      console.log('2. Check if password contains special characters');
      console.log('3. Ensure user has SELECT, INSERT, UPDATE, DELETE privileges');
      console.log('4. Try recreating the database user');
    }
  }
}

comprehensiveTest();
