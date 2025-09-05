import mysql from 'mysql2/promise';

// Direct connection test to Hostinger MySQL
async function testDatabaseConnection() {
  const config = {
    host: 'srv1639.hstgr.io',
    port: 3306,
    user: 'u745362362_crmusername',
    password: 'Aedentek@123#',
    database: 'u745362362_crm',
    ssl: false,
    connectTimeout: 10000
  };

  console.log('🧪 Testing direct database connection...');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('User:', config.user);
  console.log('Database:', config.database);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection successful!');
    
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query successful:', rows);
    
    await connection.end();
    console.log('✅ Connection closed properly');
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Error SQL State:', error.sqlState);
    console.error('Full Error:', error);
    
    return false;
  }
}

testDatabaseConnection();
