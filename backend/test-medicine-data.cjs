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
        category: 'Pain Relief',
        supplier: 'Gandhi Bai Pharma',
        manufacturer: 'ABC Pharmaceuticals',
        price: 5.50,
        quantity: 100,
        current_stock: 250,
        description: 'Pain relief and fever reducer'
      },
      {
        name: 'Amoxicillin 250mg',
        category: 'Antibiotics',
        supplier: 'Gandhi Bai Pharma',
        manufacturer: 'XYZ Pharma',
        price: 12.75,
        quantity: 60,
        current_stock: 180,
        description: 'Antibiotic for bacterial infections'
      },
      {
        name: 'Ibuprofen 400mg',
        category: 'Pain Relief',
        supplier: 'Gandhi Bai Pharma',
        manufacturer: 'DEF Medical',
        price: 8.25,
        quantity: 120,
        current_stock: 320,
        description: 'Anti-inflammatory pain reliever'
      },
      {
        name: 'Cetirizine 10mg',
        category: 'Antihistamines',
        supplier: 'Gandhi Bai Pharma',
        manufacturer: 'GHI Pharmaceuticals',
        price: 3.50,
        quantity: 50,
        current_stock: 150,
        description: 'Antihistamine for allergies'
      },
      {
        name: 'Omeprazole 20mg',
        category: 'Gastric',
        supplier: 'Gandhi Bai Pharma',
        manufacturer: 'JKL Pharma',
        price: 15.00,
        quantity: 30,
        current_stock: 90,
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
          (name, category, supplier, manufacturer, price, quantity, current_stock, description, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            medicine.name,
            medicine.category,
            medicine.supplier,
            medicine.manufacturer,
            medicine.price,
            medicine.quantity,
            medicine.current_stock,
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
