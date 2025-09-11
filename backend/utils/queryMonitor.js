// 🚀 Query Performance Monitor for CRM Backend
import db from './db/config.js';

export class QueryPerformanceMonitor {
  constructor() {
    this.slowQueries = [];
    this.queryStats = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Wrapper for database queries with performance monitoring
  async monitorQuery(query, params = [], description = '') {
    if (!this.isEnabled) {
      return await db.query(query, params);
    }

    const startTime = process.hrtime.bigint();
    const queryHash = this.hashQuery(query);
    
    try {
      const result = await db.query(query, params);
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      this.recordQueryStats(queryHash, query, executionTime, description, true);
      
      // Log slow queries
      if (executionTime > 1000) { // Queries taking more than 1 second
        this.logSlowQuery(query, params, executionTime, description);
      }
      
      return result;
      
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1000000;
      
      this.recordQueryStats(queryHash, query, executionTime, description, false);
      throw error;
    }
  }

  // Generate hash for query to group similar queries
  hashQuery(query) {
    return query.replace(/\?/g, 'PARAM').replace(/\s+/g, ' ').trim();
  }

  // Record query statistics
  recordQueryStats(queryHash, query, executionTime, description, success) {
    if (!this.queryStats.has(queryHash)) {
      this.queryStats.set(queryHash, {
        query: query,
        description: description,
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0,
        lastExecuted: new Date()
      });
    }

    const stats = this.queryStats.get(queryHash);
    stats.count++;
    stats.totalTime += executionTime;
    stats.avgTime = stats.totalTime / stats.count;
    stats.minTime = Math.min(stats.minTime, executionTime);
    stats.maxTime = Math.max(stats.maxTime, executionTime);
    stats.lastExecuted = new Date();
    
    if (!success) {
      stats.errors++;
    }
  }

  // Log slow queries
  logSlowQuery(query, params, executionTime, description) {
    const slowQuery = {
      query,
      params,
      executionTime,
      description,
      timestamp: new Date(),
      formattedTime: `${executionTime.toFixed(2)}ms`
    };

    this.slowQueries.push(slowQuery);
    
    // Keep only last 100 slow queries
    if (this.slowQueries.length > 100) {
      this.slowQueries.shift();
    }

    console.warn(`🐌 SLOW QUERY DETECTED (${executionTime.toFixed(2)}ms):`, {
      description: description || 'No description',
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      params: params.length > 0 ? params : 'No parameters'
    });
  }

  // Get performance report
  getPerformanceReport() {
    const sortedQueries = Array.from(this.queryStats.values())
      .sort((a, b) => b.avgTime - a.avgTime);

    const report = {
      totalQueries: Array.from(this.queryStats.values()).reduce((sum, stat) => sum + stat.count, 0),
      totalErrors: Array.from(this.queryStats.values()).reduce((sum, stat) => sum + stat.errors, 0),
      slowQueries: this.slowQueries.length,
      topSlowQueries: sortedQueries.slice(0, 10).map(stat => ({
        description: stat.description || 'No description',
        query: stat.query.substring(0, 100) + (stat.query.length > 100 ? '...' : ''),
        count: stat.count,
        avgTime: `${stat.avgTime.toFixed(2)}ms`,
        maxTime: `${stat.maxTime.toFixed(2)}ms`,
        errors: stat.errors
      })),
      recentSlowQueries: this.slowQueries.slice(-5).map(sq => ({
        description: sq.description || 'No description',
        query: sq.query.substring(0, 100) + (sq.query.length > 100 ? '...' : ''),
        executionTime: sq.formattedTime,
        timestamp: sq.timestamp.toISOString()
      }))
    };

    return report;
  }

  // Middleware for Express routes
  middleware() {
    return (req, res, next) => {
      // Add monitor to request object
      req.queryMonitor = this;
      
      // Monitor request timing
      const startTime = process.hrtime.bigint();
      
      res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000;
        
        if (responseTime > 2000) { // Responses taking more than 2 seconds
          console.warn(`🐌 SLOW RESPONSE (${responseTime.toFixed(2)}ms):`, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode
          });
        }
      });
      
      next();
    };
  }

  // Get database health metrics
  async getDatabaseHealth() {
    try {
      const [processlist] = await db.query('SHOW PROCESSLIST');
      const [variables] = await db.query("SHOW VARIABLES LIKE 'max_connections'");
      const [status] = await db.query("SHOW STATUS LIKE 'Threads_connected'");
      
      return {
        activeConnections: processlist.length,
        maxConnections: variables[0]?.Value || 'Unknown',
        threadsConnected: status[0]?.Value || 'Unknown',
        connectionUsage: `${((processlist.length / parseInt(variables[0]?.Value || 100)) * 100).toFixed(2)}%`
      };
      
    } catch (error) {
      console.error('Error getting database health:', error);
      return { error: 'Failed to get database health' };
    }
  }

  // Clear statistics
  clearStats() {
    this.queryStats.clear();
    this.slowQueries = [];
    console.log('📊 Query performance statistics cleared');
  }

  // Enable/disable monitoring
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`📊 Query monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Export singleton instance
export const queryMonitor = new QueryPerformanceMonitor();

// Helper function for easy query monitoring
export const monitoredQuery = async (query, params = [], description = '') => {
  return await queryMonitor.monitorQuery(query, params, description);
};

// Export middleware
export const performanceMiddleware = queryMonitor.middleware();

// Example usage in routes:
/*
import { monitoredQuery, queryMonitor } from './utils/queryMonitor.js';

// In your route:
router.get('/doctors', async (req, res) => {
  try {
    const [doctors] = await monitoredQuery(
      'SELECT id, name, email FROM doctors WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ?',
      [20],
      'Get doctors list'
    );
    
    res.json({ data: doctors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Performance report endpoint:
router.get('/admin/performance', async (req, res) => {
  const report = queryMonitor.getPerformanceReport();
  const dbHealth = await queryMonitor.getDatabaseHealth();
  
  res.json({
    performance: report,
    database: dbHealth
  });
});
*/
