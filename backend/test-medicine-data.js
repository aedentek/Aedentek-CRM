const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'srv1639.hstgr.io',
  user: process.env.DB_USER || 'u745362362_crm',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'u745362362_crm',
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false },
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000
};

async function addTestMedicineData() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 Connected to database');

    // Insert test medicine products with stock
    const testMedicines = [
      {
        name: 'Paracetamol 500mg',
        category_id: 1,
        supplier_id: 1,
        price: 5.50,
        current_stock: 250,
        min_stock_level: 50,
        max_stock_level: 500,
        description: 'Pain relief and fever reducer'
      },
      {
        name: 'Amoxicillin 250mg',
        category_id: 1,
        supplier_id: 1,
        price: 12.75,
        current_stock: 180,
        min_stock_level: 30,
        max_stock_level: 300,
        description: 'Antibiotic for bacterial infections'
      },
      {
        name: 'Ibuprofen 400mg',
        category_id: 1,
        supplier_id: 1,
        price: 8.25,
        current_stock: 320,
        min_stock_level: 75,
        max_stock_level: 600,
        description: 'Anti-inflammatory pain reliever'
      },
      {
        name: 'Cetirizine 10mg',
        category_id: 1,
        supplier_id: 1,
        price: 3.50,
        current_stock: 150,
        min_stock_level: 25,
        max_stock_level: 200,
        description: 'Antihistamine for allergies'
      },
      {
        name: 'Omeprazole 20mg',
        category_id: 1,
        supplier_id: 1,
        price: 15.00,
        current_stock: 90,
        min_stock_level: 20,
        max_stock_level: 150,
        description: 'Proton pump inhibitor for acid reflux'
      }
    ];

    console.log('📊 Adding test medicine products...');
    
    for (const medicine of testMedicines) {
      // Check if product already exists
      const [existing] = await connection.execute(
        'SELECT id FROM medicine_products WHERE name = ?',
        [medicine.name]
      );

      if (existing.length === 0) {
        const [result] = await connection.execute(
          `INSERT INTO medicine_products 
          (name, category_id, supplier_id, price, current_stock, min_stock_level, max_stock_level, description, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            medicine.name,
            medicine.category_id,
            medicine.supplier_id,
            medicine.price,
            medicine.current_stock,
            medicine.min_stock_level,
            medicine.max_stock_level,
            medicine.description
          ]
        );
        console.log(`✅ Added: ${medicine.name} - Stock: ${medicine.current_stock}`);
      } else {
        console.log(`⚠️  ${medicine.name} already exists`);
      }
    }

    // Show total stock count
    const [stockResult] = await connection.execute(
      'SELECT SUM(current_stock) as total_stock FROM medicine_products'
    );
    
    const totalStock = stockResult[0]?.total_stock || 0;
    console.log(`\n📦 Total Medicine Stock: ${totalStock} units`);
    
    // Show all products with stock
    const [products] = await connection.execute(
      'SELECT name, current_stock FROM medicine_products ORDER BY name'
    );
    
    console.log('\n📋 Medicine Products Stock Summary:');
    products.forEach(product => {
      console.log(`  • ${product.name}: ${product.current_stock} units`);
    });

  } catch (error) {
    console.error('❌ Error adding test medicine data:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
addTestMedicineData().catch(console.error);
