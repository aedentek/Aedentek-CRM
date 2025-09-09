import mysql from 'mysql2/promise';

async function testCertificates() {
  let connection;
  
  try {
    console.log('🧪 Simple Certificates Test');
    
    // Create a single connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✅ Database connected');
    
    // Test 1: Check if certificates table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'certificates'");
    console.log(`📋 Certificates table exists: ${tables.length > 0 ? 'Yes' : 'No'}`);
    
    if (tables.length > 0) {
      // Test 2: Count certificates
      const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM certificates');
      console.log(`📊 Total certificates in database: ${countResult[0].total}`);
      
      // Test 3: Get sample certificates
      const [certificates] = await connection.execute(`
        SELECT 
          id, 
          certificate_number as certificateNumber,
          patient_name as patientName,
          certificate_type as certificateType,
          status,
          created_at as createdAt
        FROM certificates 
        LIMIT 5
      `);
      
      console.log('📄 Sample certificates:');
      certificates.forEach(cert => {
        console.log(`  - ID: ${cert.id}, Number: ${cert.certificateNumber}, Patient: ${cert.patientName}, Type: ${cert.certificateType}, Status: ${cert.status}`);
      });
    }
    
    console.log('✅ Certificate system database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

testCertificates();
