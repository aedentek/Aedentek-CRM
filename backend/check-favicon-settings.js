import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkFaviconSettings() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'srv1639.hstgr.io',
    user: process.env.DB_USER || 'u745362362_crmusername',
    password: process.env.DB_PASSWORD || 'Aedentek@123#',
    database: process.env.DB_NAME || 'u745362362_crm'
  });

  try {
    console.log('🔍 Checking app_settings table...');
    
    // Check if table exists
    const [tables] = await db.execute("SHOW TABLES LIKE 'app_settings'");
    console.log('app_settings table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Get all settings related to website/favicon
      const [settings] = await db.execute(`
        SELECT setting_key, setting_value, setting_type, file_path, description 
        FROM app_settings 
        WHERE setting_key LIKE '%favicon%' OR setting_key LIKE '%title%' OR setting_key LIKE '%logo%'
        ORDER BY setting_key
      `);
      
      console.log('\n📋 Website/Favicon Settings:');
      console.log('===============================');
      settings.forEach(setting => {
        console.log(`🔹 ${setting.setting_key}:`);
        console.log(`   Value: ${setting.setting_value || '(null)'}`);
        console.log(`   Type: ${setting.setting_type}`);
        console.log(`   File Path: ${setting.file_path || '(none)'}`);
        console.log(`   Description: ${setting.description || '(none)'}`);
        console.log('');
      });
      
      // Get all settings
      const [allSettings] = await db.execute('SELECT COUNT(*) as total FROM app_settings');
      console.log(`📊 Total settings in database: ${allSettings[0].total}`);
    } else {
      console.log('❌ app_settings table does not exist!');
      console.log('💡 Need to run the create-settings-table.sql script');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.end();
  }
}

checkFaviconSettings();
