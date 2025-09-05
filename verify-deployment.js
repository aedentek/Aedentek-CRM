#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * Checks if all configurations are ready for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Pre-deployment verification for Render...\n');

let hasErrors = false;

// Check main .env file
console.log('📋 Checking main .env file...');
const mainEnvPath = path.join(__dirname, '.env');
if (fs.existsSync(mainEnvPath)) {
  const envContent = fs.readFileSync(mainEnvPath, 'utf8');
  
  // Check if database variables are uncommented
  if (envContent.includes('DB_HOST=srv1639.hstgr.io') && !envContent.includes('#DB_HOST')) {
    console.log('✅ Database configuration is active');
  } else {
    console.log('❌ Database configuration is commented out or missing');
    hasErrors = true;
  }
  
  // Check production URLs
  if (envContent.includes('VITE_API_URL=https://crm-czuu.onrender.com/api') && !envContent.includes('#VITE_API_URL=https://')) {
    console.log('✅ Production API URL configured');
  } else {
    console.log('❌ Production API URL not configured or commented out');
    hasErrors = true;
  }
  
  // Check PORT variable
  if (envContent.includes('PORT=10000')) {
    console.log('✅ PORT configured for Render');
  } else {
    console.log('❌ PORT not configured for Render');
    hasErrors = true;
  }
  
  // Check NODE_ENV
  if (envContent.includes('NODE_ENV=production')) {
    console.log('✅ NODE_ENV set to production');
  } else {
    console.log('⚠️ NODE_ENV not set to production');
  }
} else {
  console.log('❌ Main .env file not found');
  hasErrors = true;
}

// Check backend .env file
console.log('\n📋 Checking backend .env file...');
const backendEnvPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(backendEnvPath)) {
  const backendEnvContent = fs.readFileSync(backendEnvPath, 'utf8');
  
  if (backendEnvContent.includes('VITE_API_URL=https://crm-czuu.onrender.com/api')) {
    console.log('✅ Backend configured for production URLs');
  } else {
    console.log('❌ Backend still has localhost URLs');
    hasErrors = true;
  }
} else {
  console.log('⚠️ Backend .env file not found (will use main .env)');
}

// Check package.json for correct start script
console.log('\n📋 Checking backend package.json...');
const backendPackagePath = path.join(__dirname, 'backend', 'package.json');
if (fs.existsSync(backendPackagePath)) {
  const packageContent = fs.readFileSync(backendPackagePath, 'utf8');
  const packageJson = JSON.parse(packageContent);
  
  if (packageJson.scripts && packageJson.scripts.start) {
    console.log('✅ Start script found:', packageJson.scripts.start);
  } else {
    console.log('❌ No start script in backend package.json');
    hasErrors = true;
  }
} else {
  console.log('❌ Backend package.json not found');
  hasErrors = true;
}

// Check database connection test
console.log('\n📋 Testing database connection...');
try {
  // Import and test database connection
  const { default: db } = await import('./backend/db/config.js');
  await db.query('SELECT 1 as test');
  console.log('✅ Database connection test successful');
} catch (error) {
  console.log('❌ Database connection test failed:', error.message);
  hasErrors = true;
}

// Final summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ DEPLOYMENT NOT READY - Fix the issues above first');
  console.log('\n📋 Common fixes:');
  console.log('1. Ensure .env files are not commented out');
  console.log('2. Use production URLs instead of localhost');
  console.log('3. Remove quotes from DB_PASSWORD if present');
  console.log('4. Ensure PORT=10000 is set for Render');
  process.exit(1);
} else {
  console.log('✅ DEPLOYMENT READY!');
  console.log('\n🚀 Next steps for Render deployment:');
  console.log('1. git add .');
  console.log('2. git commit -m "Fix database connection and environment configuration"');
  console.log('3. git push origin main');
  console.log('4. Render will auto-deploy from GitHub');
  console.log('5. Check health endpoint: https://crm-czuu.onrender.com/health');
  process.exit(0);
}
