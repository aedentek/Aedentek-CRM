#!/usr/bin/env node

/**
 * Deployment script for backend fixes
 * This script checks if the backend is ready for deployment to Render
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Checking backend deployment readiness...');

// Check if .env file has production configuration
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('VITE_API_URL=https://crm-czuu.onrender.com/api')) {
    console.log('✅ Environment configured for production');
  } else {
    console.log('❌ Environment not configured for production');
    console.log('   Update .env file to use production URLs');
  }
  
  if (envContent.includes('NODE_ENV=production')) {
    console.log('✅ NODE_ENV set to production');
  } else {
    console.log('⚠️ NODE_ENV not set to production');
  }
} else {
  console.log('❌ .env file not found');
}

// Check if backend index.js has the improved error handling
const indexPath = path.join(process.cwd(), 'backend', 'index.js');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  if (indexContent.includes('Database connection error')) {
    console.log('✅ Improved error handling in place');
  } else {
    console.log('❌ Error handling needs improvement');
  }
  
  if (indexContent.includes('await db.query')) {
    console.log('✅ Database health checks implemented');
  } else {
    console.log('❌ Database health checks missing');
  }
} else {
  console.log('❌ backend/index.js not found');
}

// Check if database config has been optimized
const dbConfigPath = path.join(process.cwd(), 'backend', 'db', 'config.js');
if (fs.existsSync(dbConfigPath)) {
  const dbContent = fs.readFileSync(dbConfigPath, 'utf8');
  
  if (dbContent.includes('connectionLimit: 3')) {
    console.log('✅ Database connection pool optimized');
  } else {
    console.log('❌ Database connection pool not optimized');
  }
  
  if (dbContent.includes('Database pool created successfully')) {
    console.log('✅ Database logging improved');
  } else {
    console.log('❌ Database logging needs improvement');
  }
} else {
  console.log('❌ backend/db/config.js not found');
}

console.log('\n🚀 Deployment checklist:');
console.log('1. Environment variables configured for production');
console.log('2. Database connection optimized for shared hosting');
console.log('3. Error handling improved for better debugging');
console.log('4. Health check endpoints added');
console.log('5. Connection timeouts reduced for faster response');

console.log('\n📋 Manual steps for Render deployment:');
console.log('1. Commit and push these changes to your Git repository');
console.log('2. In Render dashboard, trigger a manual deploy');
console.log('3. Check the health endpoint: https://crm-czuu.onrender.com/health');
console.log('4. Monitor logs for any remaining issues');
