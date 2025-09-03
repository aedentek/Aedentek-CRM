import mysql from 'mysql2/promise';

console.log('🧪 Testing different password formats...');

const configs = [
  {
    name: 'Current (.env) password',
    host: 'srv1639.hstgr.io',
    user: 'u745362362_crmusername',
    password: 'Aedentek@123#',
    database: 'u745362362_crm'
  },
  {
    name: 'URL encoded password',
    host: 'srv1639.hstgr.io',
    user: 'u745362362_crmusername',
    password: 'Aedentek%40123%23',
    database: 'u745362362_crm'
  },
  {
    name: 'Escaped password',
    host: 'srv1639.hstgr.io',
    user: 'u745362362_crmusername',
    password: 'Aedentek\\@123\\#',
    database: 'u745362362_crm'
  }
];

async function testAllConfigs() {
  for (const config of configs) {
    console.log(`\n🔹 Testing: ${config.name}`);
    console.log(`Password: ${config.password}`);
    
    try {
      const connection = await mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        port: 3306
      });
      
      console.log('✅ Connection successful!');
      await connection.end();
      break; // Stop on first success
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
    }
  }
  
  // Test with just the hostname to check basic connectivity
  console.log('\n🔹 Testing basic MySQL server connectivity...');
  try {
    const basicConnection = await mysql.createConnection({
      host: 'srv1639.hstgr.io',
      user: 'root', // This will fail but tell us if server is reachable
      password: 'fake',
      port: 3306
    });
  } catch (error) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('✅ MySQL server is reachable (access denied is expected for root)');
    } else {
      console.log('❌ MySQL server connectivity issue:', error.message);
    }
  }
}

testAllConfigs();
