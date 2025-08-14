import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'srv1639.hstgr.io',
  user: 'u745362362_crmusername',
  password: 'Aedentek@123#',
  database: 'u745362362_crm',
  charset: 'utf8mb4'
};

async function updateImageFields() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Updating image fields to LONGTEXT for better capacity...');
    
    // Update image fields to LONGTEXT to handle large base64 strings
    const updateSQL = `
      ALTER TABLE patients 
      MODIFY COLUMN photo LONGTEXT,
      MODIFY COLUMN patientAadhar LONGTEXT,
      MODIFY COLUMN patientPan LONGTEXT,
      MODIFY COLUMN attenderAadhar LONGTEXT,
      MODIFY COLUMN attenderPan LONGTEXT
    `;
    
    await connection.execute(updateSQL);
    console.log('✅ Image fields updated to LONGTEXT successfully!');
    
    // Verify the table structure
    const [results] = await connection.execute('DESCRIBE patients');
    console.log('Updated table structure:');
    results.forEach(row => {
      if (row.Field.includes('photo') || row.Field.includes('Aadhar') || row.Field.includes('Pan')) {
        console.log(`- ${row.Field}: ${row.Type}`);
      }
    });
    
    await connection.end();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error updating image fields:', error);
    process.exit(1);
  }
}

updateImageFields();
