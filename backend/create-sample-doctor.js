import db from './db/config.js';

async function createSampleDoctor() {
  try {
    console.log('🩺 Creating sample doctor if none exist...');
    
    // Check if doctors table exists
    const [tableCheck] = await db.query("SHOW TABLES LIKE 'doctors'");
    if (tableCheck.length === 0) {
      console.log('❌ Doctors table does not exist. Creating table...');
      
      // Create doctors table
      await db.query(`
        CREATE TABLE doctors (
          id VARCHAR(20) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(20),
          address TEXT,
          specialization VARCHAR(255),
          department VARCHAR(255),
          join_date DATE,
          salary DECIMAL(10,2),
          status ENUM('Active', 'Inactive') DEFAULT 'Active',
          photo TEXT,
          documents JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          deleted_by VARCHAR(255) NULL
        )
      `);
      console.log('✅ Doctors table created successfully');
    }
    
    // Check if any active doctors exist
    const [activeCount] = await db.query('SELECT COUNT(*) as count FROM doctors WHERE deleted_at IS NULL');
    const activeDoctors = activeCount[0].count;
    
    console.log(`📊 Found ${activeDoctors} active doctors`);
    
    if (activeDoctors === 0) {
      console.log('🏥 No active doctors found. Creating sample doctor...');
      
      const sampleDoctor = {
        id: 'DOC001',
        name: 'Dr. Rajesh Kumar',
        email: 'dr.rajesh@gandhibai.com',
        phone: '9876543210',
        address: 'Gandhi Bai De-Addiction Center, Main Branch',
        specialization: 'Addiction Medicine',
        department: 'De-Addiction',
        join_date: '2024-01-01',
        salary: 50000.00,
        status: 'Active',
        photo: null,
        documents: JSON.stringify({})
      };
      
      await db.query(
        `INSERT INTO doctors (id, name, email, phone, address, specialization, department, join_date, salary, status, photo, documents) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sampleDoctor.id,
          sampleDoctor.name,
          sampleDoctor.email,
          sampleDoctor.phone,
          sampleDoctor.address,
          sampleDoctor.specialization,
          sampleDoctor.department,
          sampleDoctor.join_date,
          sampleDoctor.salary,
          sampleDoctor.status,
          sampleDoctor.photo,
          sampleDoctor.documents
        ]
      );
      
      console.log('✅ Sample doctor created successfully:', sampleDoctor.name);
    } else {
      console.log('✅ Active doctors already exist, no need to create sample data');
    }
    
    // Verify the result
    const [finalCount] = await db.query('SELECT COUNT(*) as count FROM doctors WHERE deleted_at IS NULL');
    console.log(`🎯 Final active doctors count: ${finalCount[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample doctor:', error);
    process.exit(1);
  }
}

createSampleDoctor();
