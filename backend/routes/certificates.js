import express from 'express';
import db from '../db/config.js';

const router = express.Router();

console.log('📜 Certificates router loaded with full CRUD operations');

// GET all certificates
router.get('/certificates', async (req, res) => {
  try {
    console.log('🔍 GET /api/certificates called');
    
    const [rows] = await db.execute(`
      SELECT 
        id,
        certificate_number as certificateNumber,
        patient_id as patientId,
        patient_name as patientName,
        certificate_type as certificateType,
        issued_date as issuedDate,
        valid_until as validUntil,
        title,
        description,
        doctor_name as doctorName,
        doctor_signature as doctorSignature,
        hospital_stamp as hospitalStamp,
        certificate_template as certificateTemplate,
        documents,
        status,
        issued_by as issuedBy,
        notes,
        created_at as createdAt,
        updated_at as updatedAt,
        created_by as createdBy,
        updated_by as updatedBy
      FROM certificates 
      ORDER BY issued_date DESC, created_at DESC
    `);
    
    // Parse documents JSON field
    const certificates = rows.map(certificate => ({
      ...certificate,
      documents: certificate.documents ? JSON.parse(certificate.documents) : []
    }));
    
    console.log(`✅ Retrieved ${certificates.length} certificates from database`);
    
    res.json({
      success: true,
      data: certificates,
      count: certificates.length
    });
  } catch (error) {
    console.error('❌ Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates',
      error: error.message
    });
  }
});

// GET certificate by ID
router.get('/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 GET /api/certificates/${id} called`);
    
    const [rows] = await db.execute(`
      SELECT 
        id,
        certificate_number as certificateNumber,
        patient_id as patientId,
        patient_name as patientName,
        certificate_type as certificateType,
        issued_date as issuedDate,
        valid_until as validUntil,
        title,
        description,
        doctor_name as doctorName,
        doctor_signature as doctorSignature,
        hospital_stamp as hospitalStamp,
        certificate_template as certificateTemplate,
        documents,
        status,
        issued_by as issuedBy,
        notes,
        created_at as createdAt,
        updated_at as updatedAt,
        created_by as createdBy,
        updated_by as updatedBy
      FROM certificates 
      WHERE id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    // Parse documents JSON field
    const certificate = {
      ...rows[0],
      documents: rows[0].documents ? JSON.parse(rows[0].documents) : []
    };
    
    console.log(`✅ Retrieved certificate: ${certificate.certificateNumber}`);
    
    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('❌ Error fetching certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate',
      error: error.message
    });
  }
});

// GET certificates for specific patient
router.get('/certificates/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log(`🔍 GET /api/certificates/patient/${patientId} called`);
    
    const [rows] = await db.execute(`
      SELECT 
        id,
        certificate_number as certificateNumber,
        patient_id as patientId,
        patient_name as patientName,
        certificate_type as certificateType,
        issued_date as issuedDate,
        valid_until as validUntil,
        title,
        description,
        doctor_name as doctorName,
        doctor_signature as doctorSignature,
        hospital_stamp as hospitalStamp,
        certificate_template as certificateTemplate,
        documents,
        status,
        issued_by as issuedBy,
        notes,
        created_at as createdAt,
        updated_at as updatedAt,
        created_by as createdBy,
        updated_by as updatedBy
      FROM certificates 
      WHERE patient_id = ?
      ORDER BY issued_date DESC, created_at DESC
    `, [patientId]);
    
    // Parse documents JSON field
    const certificates = rows.map(certificate => ({
      ...certificate,
      documents: certificate.documents ? JSON.parse(certificate.documents) : []
    }));
    
    console.log(`✅ Retrieved ${certificates.length} certificates for patient ${patientId}`);
    
    res.json({
      success: true,
      data: certificates,
      count: certificates.length
    });
  } catch (error) {
    console.error('❌ Error fetching patient certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient certificates',
      error: error.message
    });
  }
});

// POST - Add new certificate
router.post('/certificates', async (req, res) => {
  try {
    console.log('📝 POST /api/certificates called');
    console.log('Request body:', req.body);
    
    const {
      certificateNumber,
      patientId,
      patientName,
      certificateType,
      issuedDate,
      validUntil,
      title,
      description,
      doctorName,
      doctorSignature,
      hospitalStamp,
      certificateTemplate,
      documents,
      status,
      issuedBy,
      notes,
      createdBy
    } = req.body;
    
    // Validate required fields
    if (!patientId || !patientName || !certificateType || !issuedDate || !title) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patientId, patientName, certificateType, issuedDate, title are required'
      });
    }
    
    // Auto-generate certificate number if not provided
    const finalCertificateNumber = certificateNumber || `CERT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Convert documents array to JSON string
    const documentsJson = documents ? JSON.stringify(documents) : null;
    
    const [result] = await db.execute(`
      INSERT INTO certificates (
        certificate_number,
        patient_id,
        patient_name,
        certificate_type,
        issued_date,
        valid_until,
        title,
        description,
        doctor_name,
        doctor_signature,
        hospital_stamp,
        certificate_template,
        documents,
        status,
        issued_by,
        notes,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      finalCertificateNumber,
      patientId,
      patientName,
      certificateType,
      issuedDate,
      validUntil || null,
      title,
      description || null,
      doctorName || null,
      doctorSignature || null,
      hospitalStamp || null,
      certificateTemplate || 'standard',
      documentsJson,
      status || 'Active',
      issuedBy || null,
      notes || null,
      createdBy || null
    ]);
    
    console.log(`✅ Certificate added successfully with ID: ${result.insertId}`);
    
    res.status(201).json({
      success: true,
      message: 'Certificate added successfully',
      data: {
        id: result.insertId,
        certificateNumber: finalCertificateNumber,
        documents: documents || []
      }
    });
  } catch (error) {
    console.error('❌ Error adding certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add certificate',
      error: error.message
    });
  }
});

// PUT - Update existing certificate
router.put('/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 PUT /api/certificates/${id} called`);
    console.log('Request body:', req.body);
    
    const {
      certificateNumber,
      patientId,
      patientName,
      certificateType,
      issuedDate,
      validUntil,
      title,
      description,
      doctorName,
      doctorSignature,
      hospitalStamp,
      certificateTemplate,
      documents,
      status,
      issuedBy,
      notes,
      updatedBy
    } = req.body;
    
    // Convert documents array to JSON string
    const documentsJson = documents ? JSON.stringify(documents) : null;
    
    const [result] = await db.execute(`
      UPDATE certificates SET
        certificate_number = ?,
        patient_id = ?,
        patient_name = ?,
        certificate_type = ?,
        issued_date = ?,
        valid_until = ?,
        title = ?,
        description = ?,
        doctor_name = ?,
        doctor_signature = ?,
        hospital_stamp = ?,
        certificate_template = ?,
        documents = ?,
        status = ?,
        issued_by = ?,
        notes = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      certificateNumber,
      patientId,
      patientName,
      certificateType,
      issuedDate,
      validUntil,
      title,
      description,
      doctorName,
      doctorSignature,
      hospitalStamp,
      certificateTemplate,
      documentsJson,
      status,
      issuedBy,
      notes,
      updatedBy,
      id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    console.log(`✅ Certificate updated successfully - ID: ${id}`);
    
    res.json({
      success: true,
      message: 'Certificate updated successfully',
      data: {
        id: parseInt(id),
        documents: documents || []
      }
    });
  } catch (error) {
    console.error('❌ Error updating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update certificate',
      error: error.message
    });
  }
});

// DELETE certificate
router.delete('/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ DELETE /api/certificates/${id} called`);
    
    // First check if certificate exists
    const [existingCertificate] = await db.execute('SELECT id, certificate_number FROM certificates WHERE id = ?', [id]);
    
    if (existingCertificate.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    // Delete the certificate
    await db.execute('DELETE FROM certificates WHERE id = ?', [id]);
    
    console.log(`✅ Certificate deleted successfully - ID: ${id}`);
    
    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete certificate',
      error: error.message
    });
  }
});

// GET certificate statistics
router.get('/certificates/stats/overview', async (req, res) => {
  try {
    console.log('📊 GET /api/certificates/stats/overview called');
    
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as totalCertificates,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as activeCertificates,
        COUNT(CASE WHEN status = 'Expired' THEN 1 END) as expiredCertificates,
        COUNT(CASE WHEN status = 'Revoked' THEN 1 END) as revokedCertificates,
        COUNT(CASE WHEN status = 'Draft' THEN 1 END) as draftCertificates,
        COUNT(CASE WHEN certificate_type = 'Medical Certificate' THEN 1 END) as medicalCertificates,
        COUNT(CASE WHEN certificate_type = 'Fitness Certificate' THEN 1 END) as fitnessCertificates,
        COUNT(CASE WHEN certificate_type = 'Vaccination Certificate' THEN 1 END) as vaccinationCertificates,
        COUNT(CASE WHEN DATE(issued_date) = CURDATE() THEN 1 END) as todayCertificates,
        COUNT(CASE WHEN MONTH(issued_date) = MONTH(CURDATE()) AND YEAR(issued_date) = YEAR(CURDATE()) THEN 1 END) as thisMonthCertificates
      FROM certificates
    `);
    
    console.log('✅ Certificate statistics retrieved');
    
    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('❌ Error fetching certificate statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate statistics',
      error: error.message
    });
  }
});

export default router;
