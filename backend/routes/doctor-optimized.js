// 🚀 OPTIMIZED Doctor Routes with Query Optimization
import express from 'express';
import db from '../db/config.js';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

// ✅ OPTIMIZED: Get all doctors with pagination, search, and specific columns
router.get('/doctors', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    
    let whereClause = 'WHERE d.deleted_at IS NULL';
    let params = [];
    
    // Add search filter
    if (search) {
      whereClause += ' AND (d.name LIKE ? OR d.email LIKE ? OR d.phone LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    // Add category filter
    if (category) {
      whereClause += ' AND d.category_id = ?';
      params.push(category);
    }
    
    // ✅ OPTIMIZED: SELECT specific columns with JOIN
    const query = `
      SELECT 
        d.id, d.name, d.email, d.phone, d.qualification, 
        d.experience, d.created_at, d.status,
        dc.name as category_name,
        dc.id as category_id
      FROM doctors d
      LEFT JOIN doctor_categories dc ON d.category_id = dc.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await db.query(query, [...params, limit, offset]);
    
    // ✅ OPTIMIZED: Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM doctors d 
      ${whereClause}
    `;
    const [countResult] = await db.query(countQuery, params);
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit),
        hasNextPage: page < Math.ceil(countResult[0].total / limit),
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch doctors' 
    });
  }
});

// ✅ OPTIMIZED: Get doctor categories with caching
router.get('/doctor-categories', async (req, res) => {
  try {
    const cacheKey = 'doctor_categories_active';
    
    // Check cache first
    let categories = cache.get(cacheKey);
    
    if (!categories) {
      // ✅ OPTIMIZED: Specific columns, no SELECT *
      const [rows] = await db.query(`
        SELECT id, name, description, status, created_at
        FROM doctor_categories 
        WHERE status = 'active' 
        ORDER BY name ASC
      `);
      
      categories = rows;
      cache.set(cacheKey, categories);
      console.log('📦 Doctor categories cached');
    }
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('Error fetching doctor categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    });
  }
});

// ✅ OPTIMIZED: Get doctor by ID with related data in single query
router.get('/doctors/:id', async (req, res) => {
  try {
    const doctorId = req.params.id;
    
    // ✅ OPTIMIZED: Single query with JOIN instead of multiple queries
    const [rows] = await db.query(`
      SELECT 
        d.id, d.name, d.email, d.phone, d.qualification, d.experience,
        d.address, d.emergency_contact, d.created_at, d.updated_at,
        dc.name as category_name, dc.id as category_id,
        COUNT(da.id) as total_attendance
      FROM doctors d
      LEFT JOIN doctor_categories dc ON d.category_id = dc.id
      LEFT JOIN doctor_attendance da ON d.id = da.doctor_id
      WHERE d.id = ? AND d.deleted_at IS NULL
      GROUP BY d.id
    `, [doctorId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Doctor not found' 
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch doctor' 
    });
  }
});

// ✅ OPTIMIZED: Get doctor salary history with pagination
router.get('/doctors/:id/salary-history', async (req, res) => {
  try {
    const doctorId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // ✅ OPTIMIZED: Specific columns with pagination
    const [rows] = await db.query(`
      SELECT 
        id, payment_amount, payment_date, payment_mode,
        previous_total_paid, new_total_paid, notes, created_at
      FROM doctor_salary_history 
      WHERE doctor_id = ? 
      ORDER BY payment_date DESC, created_at DESC
      LIMIT ? OFFSET ?
    `, [doctorId, limit, offset]);
    
    // Count for pagination
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM doctor_salary_history WHERE doctor_id = ?',
      [doctorId]
    );
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching salary history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch salary history' 
    });
  }
});

// ✅ OPTIMIZED: Create doctor with transaction
router.post('/doctors', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      name, email, phone, qualification, experience,
      category_id, address, emergency_contact
    } = req.body;
    
    // Generate doctor ID
    const [lastDoctor] = await connection.query(`
      SELECT id FROM doctors 
      WHERE id REGEXP '^DOC[0-9]{3}$' 
      ORDER BY CAST(SUBSTRING(id, 4) AS UNSIGNED) DESC 
      LIMIT 1
    `);
    
    const lastNumber = lastDoctor.length > 0 ? 
      parseInt(lastDoctor[0].id.substring(3)) : 0;
    const newId = `DOC${String(lastNumber + 1).padStart(3, '0')}`;
    
    // ✅ OPTIMIZED: Insert with specific columns
    const [result] = await connection.query(`
      INSERT INTO doctors (
        id, name, email, phone, qualification, experience,
        category_id, address, emergency_contact, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [newId, name, email, phone, qualification, experience, 
        category_id, address, emergency_contact]);
    
    await connection.commit();
    
    // Clear cache
    cache.del('doctor_categories_active');
    
    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: { id: newId, ...req.body }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error creating doctor:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create doctor' 
    });
  } finally {
    connection.release();
  }
});

// ✅ OPTIMIZED: Bulk operations for efficiency
router.post('/doctors/bulk-status-update', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { doctorIds, status } = req.body;
    
    if (!Array.isArray(doctorIds) || doctorIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Doctor IDs array is required' 
      });
    }
    
    await connection.beginTransaction();
    
    // ✅ OPTIMIZED: Bulk update with IN clause
    const placeholders = doctorIds.map(() => '?').join(',');
    await connection.query(`
      UPDATE doctors 
      SET status = ?, updated_at = NOW() 
      WHERE id IN (${placeholders})
    `, [status, ...doctorIds]);
    
    await connection.commit();
    
    res.json({
      success: true,
      message: `Updated ${doctorIds.length} doctors successfully`
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error bulk updating doctors:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update doctors' 
    });
  } finally {
    connection.release();
  }
});

// ✅ OPTIMIZED: Analytics endpoint with aggregated queries
router.get('/doctors/analytics', async (req, res) => {
  try {
    const cacheKey = 'doctor_analytics';
    let analytics = cache.get(cacheKey);
    
    if (!analytics) {
      // ✅ OPTIMIZED: Single query with multiple aggregations
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total_doctors,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_doctors,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_doctors,
          COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_doctors,
          AVG(experience) as avg_experience,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recent_additions
        FROM doctors
      `);
      
      analytics = stats[0];
      cache.set(cacheKey, analytics, 600); // Cache for 10 minutes
    }
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Error fetching doctor analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    });
  }
});

export default router;
