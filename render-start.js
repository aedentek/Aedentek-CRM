#!/usr/bin/env node

/**
 * Render.com Production Startup Script for Gandhi Bai Healthcare CRM
 * This script ensures proper startup for both frontend and backend
 */

import { startServer } from './server/server.js';

console.log('🚀 Starting Gandhi Bai Healthcare CRM on Render.com...');
console.log(`📅 Deployment Date: ${new Date().toISOString()}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`🔧 Port: ${process.env.PORT || '4000'}`);

// Start the server with error handling
startServer().catch((error) => {
  console.error('💥 Application startup failed:', error);
  console.error('📋 Error details:', error.message);
  process.exit(1);
});
