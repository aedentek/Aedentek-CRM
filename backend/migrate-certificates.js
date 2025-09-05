import db from './db/config.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runCertificatesMigration() {
  try {
    console.log('📜 Creating certificates table...');
    
    // Read the SQL file
    const sqlPath = join(__dirname, 'dbmodels', 'create-certificates-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual statements and filter out empty ones
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`🔧 Executing statement ${i + 1}/${statements.length}...`);
          await db.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          // If it's a "table already exists" error, that's okay
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`⚠️ Table already exists - skipping creation`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message);
            // Continue with other statements
          }
        }
      }
    }
    
    console.log('✅ Certificates migration completed successfully');
    
    // Test the table by selecting some data
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM certificates');
    console.log(`📊 Certificates table has ${rows[0].count} records`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running certificates migration:', error);
    process.exit(1);
  }
}

runCertificatesMigration();
