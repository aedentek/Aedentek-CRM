import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const testDatabaseTables = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });

    console.log('✅ Database connected successfully');

    // Test showing all tables
    console.log('\n📋 Testing SHOW TABLES:');
    try {
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('✅ Available tables:', tables.map(t => Object.values(t)[0]));
    } catch (error) {
      console.log('❌ Error showing tables:', error.message);
    }

    // Test specific tables
    const tablesToTest = [
      'medicine_categories',
      'medicine_suppliers', 
      'medicine_products',
      'staff_categories',
      'patients',
      'settings',
      'doctors'
    ];

    for (const table of tablesToTest) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ Table '${table}': ${rows[0].count} records`);
      } catch (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
      }
    }

  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

testDatabaseTables();
