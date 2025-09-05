import db from './db/config.js';

async function createSampleAttendance() {
  try {
    console.log('🎯 Creating sample attendance records for today...');
    
    // First, get all patients
    const [patients] = await db.query('SELECT id, name, phone FROM patients');
    console.log(`👥 Found ${patients.length} patients`);
    
    if (patients.length === 0) {
      console.log('❌ No patients found. Cannot create attendance records.');
      return;
    }
    
    // Today's date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log(`📅 Creating attendance for date: ${today}`);
    
    // Create attendance records for all patients for today
    for (const patient of patients) {
      const attendanceData = {
        patient_id: patient.id,
        patient_name: patient.name,
        date: today,
        status: Math.random() > 0.3 ? 'Present' : (Math.random() > 0.5 ? 'Absent' : 'Late'), // 70% present, 15% absent, 15% late
        check_in_time: Math.random() > 0.3 ? 
          `${8 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00` : 
          null, // Only if present or late
        notes: Math.random() > 0.5 ? 'Regular attendance' : null
      };
      
      // Insert attendance record
      await db.query(`
        INSERT INTO patient_attendance 
        (patient_id, patient_name, date, status, check_in_time, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        attendanceData.patient_id,
        attendanceData.patient_name,
        attendanceData.date,
        attendanceData.status,
        attendanceData.check_in_time,
        attendanceData.notes
      ]);
      
      console.log(`✅ Created attendance for ${attendanceData.patient_name} - ${attendanceData.status}`);
    }
    
    // Verify the records were created
    const [records] = await db.query(`
      SELECT 
        pa.id,
        pa.patient_id,
        pa.patient_name,
        pa.status,
        pa.check_in_time,
        DATE_FORMAT(pa.date, '%Y-%m-%d') as date
      FROM patient_attendance pa 
      WHERE pa.date = ? 
      ORDER BY pa.check_in_time
    `, [today]);
    
    console.log(`\n📊 Successfully created ${records.length} attendance records for today:`);
    records.forEach(record => {
      console.log(`   ${record.patient_name} (ID: ${record.patient_id}) - ${record.status} at ${record.check_in_time || 'N/A'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample attendance:', error);
    process.exit(1);
  }
}

createSampleAttendance();
