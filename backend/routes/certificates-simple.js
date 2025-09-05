import express from 'express';
import db from '../db/config.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

console.log('📜 Simplified Certificates router loaded with photo upload');

// Configure multer for certificate photo uploads - save to Photos directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './Photos/certificates';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cert-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  }
});

// GET all certificates
router.get('/certificates', async (req, res) => {
  try {
    console.log('🔍 GET /api/certificates called');
    
    const [rows] = await db.execute(`
      SELECT 
        id,
        name as patientName,
        certificate_type as certificateType,
        issued_date as issuedDate,
        description,
        certificate_photo as certificatePhoto,
        created_at as createdAt,
        updated_at as updatedAt
      FROM certificates 
      ORDER BY issued_date DESC, created_at DESC
    `);
    
    console.log(`✅ Retrieved ${rows.length} certificates from database`);
    
    res.json({
      success: true,
      data: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch certificates',
      message: error.message
    });
  }
});

// GET certificate statistics
router.get('/certificates/stats/overview', async (req, res) => {
  try {
    console.log('📊 GET /api/certificates/stats/overview called');
    
    const [totalResult] = await db.execute('SELECT COUNT(*) as total FROM certificates');
    const [thisMonthResult] = await db.execute(`
      SELECT COUNT(*) as thisMonth 
      FROM certificates 
      WHERE MONTH(issued_date) = MONTH(CURRENT_DATE()) 
      AND YEAR(issued_date) = YEAR(CURRENT_DATE())
    `);
    const [todayResult] = await db.execute(`
      SELECT COUNT(*) as today 
      FROM certificates 
      WHERE DATE(issued_date) = CURRENT_DATE()
    `);
    
    const stats = {
      total: totalResult[0].total,
      thisMonth: thisMonthResult[0].thisMonth,
      today: todayResult[0].today
    };
    
    console.log('✅ Certificate statistics retrieved');
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching certificate statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch certificate statistics',
      message: error.message
    });
  }
});

// GET single certificate by ID
router.get('/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 GET /api/certificates/${id} called`);
    
    const [rows] = await db.execute(`
      SELECT 
        id,
        name as patientName,
        certificate_type as certificateType,
        issued_date as issuedDate,
        description,
        certificate_photo as certificatePhoto,
        created_at as createdAt,
        updated_at as updatedAt
      FROM certificates 
      WHERE id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }
    
    console.log(`✅ Retrieved certificate: ${rows[0].patientName}`);
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('❌ Error fetching certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch certificate',
      message: error.message
    });
  }
});

// POST create new certificate with photo upload
router.post('/certificates', upload.single('certificatePhoto'), async (req, res) => {
  try {
    console.log('📝 POST /api/certificates called');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    
    const { patientName, certificateType, issuedDate, description } = req.body;
    
    // Validation
    if (!patientName || !certificateType || !issuedDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: patientName, certificateType, issuedDate'
      });
    }
    
    const certificatePhoto = req.file ? req.file.path : null;
    
    const [result] = await db.execute(`
      INSERT INTO certificates (name, certificate_type, issued_date, description, certificate_photo)
      VALUES (?, ?, ?, ?, ?)
    `, [patientName, certificateType, issuedDate, description, certificatePhoto]);
    
    // Fetch the created certificate
    const [newCertificate] = await db.execute(`
      SELECT 
        id,
        name as patientName,
        certificate_type as certificateType,
        issued_date as issuedDate,
        description,
        certificate_photo as certificatePhoto,
        created_at as createdAt,
        updated_at as updatedAt
      FROM certificates 
      WHERE id = ?
    `, [result.insertId]);
    
    console.log(`✅ Certificate created: ${newCertificate[0].patientName}`);
    
    res.status(201).json({
      success: true,
      data: newCertificate[0],
      message: 'Certificate created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create certificate',
      message: error.message
    });
  }
});

// PUT update certificate with photo upload
router.put('/certificates/:id', upload.single('certificatePhoto'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 PUT /api/certificates/${id} called`);
    
    const { patientName, certificateType, issuedDate, description } = req.body;
    
    // Check if certificate exists
    const [existing] = await db.execute('SELECT * FROM certificates WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }
    
    // Prepare update fields
    let updateFields = [];
    let updateValues = [];
    
    if (patientName) {
      updateFields.push('name = ?');
      updateValues.push(patientName);
    }
    if (certificateType) {
      updateFields.push('certificate_type = ?');
      updateValues.push(certificateType);
    }
    if (issuedDate) {
      updateFields.push('issued_date = ?');
      updateValues.push(issuedDate);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (req.file) {
      updateFields.push('certificate_photo = ?');
      updateValues.push(req.file.path);
      
      // Delete old photo if exists
      if (existing[0].certificate_photo && fs.existsSync(existing[0].certificate_photo)) {
        fs.unlinkSync(existing[0].certificate_photo);
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    updateValues.push(id);
    
    await db.execute(`
      UPDATE certificates 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, updateValues);
    
    // Fetch updated certificate
    const [updated] = await db.execute(`
      SELECT 
        id,
        name as patientName,
        certificate_type as certificateType,
        issued_date as issuedDate,
        description,
        certificate_photo as certificatePhoto,
        created_at as createdAt,
        updated_at as updatedAt
      FROM certificates 
      WHERE id = ?
    `, [id]);
    
    console.log(`✅ Certificate updated: ${updated[0].patientName}`);
    
    res.json({
      success: true,
      data: updated[0],
      message: 'Certificate updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update certificate',
      message: error.message
    });
  }
});

// DELETE certificate
router.delete('/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ DELETE /api/certificates/${id} called`);
    
    // Get certificate to delete photo file
    const [existing] = await db.execute('SELECT certificate_photo FROM certificates WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }
    
    // Delete certificate from database
    await db.execute('DELETE FROM certificates WHERE id = ?', [id]);
    
    // Delete photo file if exists
    if (existing[0].certificate_photo && fs.existsSync(existing[0].certificate_photo)) {
      fs.unlinkSync(existing[0].certificate_photo);
    }
    
    console.log(`✅ Certificate deleted: ID ${id}`);
    
    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete certificate',
      message: error.message
    });
  }
});

export default router;
