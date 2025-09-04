// Performance monitoring and health check endpoints
import express from 'express';
import db from '../db/config.js';

const router = express.Router();

// Database performance check
router.get('/db-performance', async (req, res) => {
  try {
    const start = Date.now();
    
    // Simple query to test database performance
    await db.execute('SELECT 1');
    const dbLatency = Date.now() - start;
    
    // Get connection pool status
    const poolStatus = {
      totalConnections: db.pool._allConnections.length,
      freeConnections: db.pool._freeConnections.length,
      queueLength: db.pool._connectionQueue.length
    };
    
    res.json({
      status: 'healthy',
      dbLatency: `${dbLatency}ms`,
      poolStatus,
      timestamp: new Date().toISOString(),
      recommendations: dbLatency > 1000 ? ['High latency detected', 'Consider connection optimization'] : []
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API response time test
router.get('/response-time', async (req, res) => {
  const start = Date.now();
  
  try {
    // Test different query complexities
    const simpleQuery = Date.now();
    await db.execute('SELECT 1');
    const simpleTime = Date.now() - simpleQuery;
    
    const countQuery = Date.now();
    await db.execute('SELECT COUNT(*) FROM patients WHERE is_deleted = FALSE');
    const countTime = Date.now() - countQuery;
    
    const totalTime = Date.now() - start;
    
    res.json({
      simpleQuery: `${simpleTime}ms`,
      countQuery: `${countTime}ms`,
      totalTime: `${totalTime}ms`,
      status: totalTime > 5000 ? 'slow' : totalTime > 2000 ? 'moderate' : 'fast',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
