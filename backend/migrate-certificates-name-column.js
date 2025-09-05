import db from './db/config.js';
import fs from 'fs';
import path from 'path';

async function updateCertificatesNameColumn() {
  try {
    console.log('Starting migration: Update certificates table patient_name to name...');

    // Read the SQL migration file
    const sqlPath = path.join(process.cwd(), 'dbmodels', 'update-certificates-name-column.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split the SQL content by semicolons to execute each statement separately
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);

    for (const statement of statements) {
      if (statement) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await db.execute(statement);
      }
    }

    // Verify the change
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'certificates'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n✅ Migration completed successfully!');
    console.log('Current certificates table columns:');
    columns.forEach(col => console.log(`  - ${col.COLUMN_NAME}`));

    // Test data retrieval with new column
    const [testData] = await db.execute('SELECT id, name, certificate_type FROM certificates LIMIT 3');
    console.log('\nSample data with new column:');
    testData.forEach(row => {
      console.log(`  ID: ${row.id} | Name: ${row.name} | Type: ${row.certificate_type}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

updateCertificatesNameColumn();
