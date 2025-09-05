import db from './db/config.js';

async function updateCertificatesSchema() {
  try {
    console.log('🔄 Starting certificates schema update...');
    
    // First, let's check if the current table structure exists
    const [columns] = await db.execute(`
      SHOW COLUMNS FROM certificates
    `);
    
    console.log('📋 Current table columns:', columns.map(col => col.Field));
    
    // Create backup table with current data
    await db.execute(`
      CREATE TABLE certificates_backup AS SELECT * FROM certificates
    `);
    console.log('💾 Backup table created');
    
    // Drop current table
    await db.execute(`DROP TABLE certificates`);
    console.log('🗑️ Old table dropped');
    
    // Create new simplified table
    await db.execute(`
      CREATE TABLE certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_name VARCHAR(255) NOT NULL,
        certificate_type VARCHAR(255) NOT NULL,
        issued_date DATE NOT NULL,
        description TEXT,
        certificate_photo VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_patient_name (patient_name),
        INDEX idx_issued_date (issued_date),
        INDEX idx_certificate_type (certificate_type)
      )
    `);
    console.log('✅ New simplified table created');
    
    // Migrate existing data
    await db.execute(`
      INSERT INTO certificates (patient_name, certificate_type, issued_date, description)
      SELECT patient_name, certificate_type, issued_date, description 
      FROM certificates_backup
    `);
    console.log('📦 Data migrated to new table');
    
    // Drop backup table
    await db.execute(`DROP TABLE certificates_backup`);
    console.log('🧹 Backup table cleaned up');
    
    console.log('🎉 Certificate schema successfully updated!');
    console.log('📝 New fields: patient_name, certificate_type, issued_date, description, certificate_photo');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema update failed:', error);
    process.exit(1);
  }
}

updateCertificatesSchema();
