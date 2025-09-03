import mysql from 'mysql2/promise';

console.log('Testing direct connection...');

async function testDirectConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'srv1639.hstgr.io',
      user: 'u745362362_crmusername',
      password: 'Aedentek@123#',
      database: 'u745362362_crm',
      port: 3306
    });
    
    console.log('✅ Direct connection successful!');
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ Query result:', rows[0]);
    await connection.end();
  } catch (error) {
    console.error('❌ Direct connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('SQL State:', error.sqlState);
    
    // Try with different encoding
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔄 Trying alternative connection...');
      try {
        const connection2 = await mysql.createConnection({
          host: 'srv1639.hstgr.io',
          user: 'u745362362_crmusername', 
          password: 'Aedentek@123#',
          database: 'u745362362_crm',
          port: 3306,
          charset: 'utf8mb4'
        });
        console.log('✅ Alternative connection successful!');
        await connection2.end();
      } catch (error2) {
        console.error('❌ Alternative connection also failed:', error2.message);
      }
    }
  }
}

testDirectConnection();
