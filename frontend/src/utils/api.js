/**
 * 🔗 UNIFIED API CONFIGURATION
 * This file centralizes all API endpoints and database connections
 * Use this as the single source of truth for all API calls
 */

// ===================================
// API CONFIGURATION
// ===================================

// Main backend server configuration
export const API_CONFIG = {
  // Backend server (where your Hostinger database is connected)
  BACKEND_URL: (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api$/, ''),
  BACKEND_API: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  
  // Frontend development server
  FRONTEND_URL: import.meta.env.VITE_BASE_URL || 'http://localhost:8080',
  
  // Request timeout
  TIMEOUT: 10000,
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// ===================================
// UNIFIED API CALLER
// ===================================

/**
 * Unified API call function with automatic error handling
 */
export async function apiCall(endpoint, options = {}) {
  try {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${API_CONFIG.BACKEND_API}/${cleanEndpoint}`;
    
    console.log(`🔗 API Call: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
      ...options,
    });

    console.log(`📡 Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Success: Received ${Array.isArray(data) ? data.length + ' items' : 'data'}`);
    return data;
    
  } catch (error) {
    console.error('❌ API call failed:', error.message);
    throw error;
  }
}

// ===================================
// SETTINGS API (Hostinger Database)
// ===================================

export const settingsAPI = {
  // Get all settings from app_settings table
  getAll: () => apiCall('settings'),
  
  // Get specific setting by key
  get: (key) => apiCall(`settings/${key}`),
  
  // Update specific setting
  update: (key, value) => apiCall(`settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ setting_value: value })
  }),
  
  // Create new setting
  create: (key, value, type = 'text', description = '') => apiCall('settings', {
    method: 'POST',
    body: JSON.stringify({
      setting_key: key,
      setting_value: value,
      setting_type: type,
      description: description
    })
  })
};

// ===================================
// PATIENTS API
// ===================================

export const patientsAPI = {
  getAll: () => apiCall('patients'),
  getById: (id) => apiCall(`patients/${id}`),
  create: (data) => apiCall('patients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`patients/${id}`, { method: 'DELETE' })
};

// ===================================
// USERS & ROLES API
// ===================================

export const usersAPI = {
  getAll: () => apiCall('management-users'),
  getById: (id) => apiCall(`management-users/${id}`),
  create: (data) => apiCall('management-users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`management-users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`management-users/${id}`, { method: 'DELETE' })
};

export const rolesAPI = {
  getAll: () => apiCall('roles'),
  create: (data) => apiCall('roles', { method: 'POST', body: JSON.stringify(data) })
};

// ===================================
// DOCTORS API
// ===================================

export const doctorsAPI = {
  getAll: () => apiCall('doctors'),
  getById: (id) => apiCall(`doctors/${id}`),
  create: (data) => apiCall('doctors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`doctors/${id}`, { method: 'DELETE' })
};

// ===================================
// STAFF API
// ===================================

export const staffAPI = {
  getAll: () => apiCall('staff'),
  getById: (id) => apiCall(`staff/${id}`),
  create: (data) => apiCall('staff', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`staff/${id}`, { method: 'DELETE' })
};

// ===================================
// MEDICINE API
// ===================================

export const medicineAPI = {
  products: {
    getAll: () => apiCall('medicine-products'),
    getById: (id) => apiCall(`medicine-products/${id}`),
    create: (data) => apiCall('medicine-products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`medicine-products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`medicine-products/${id}`, { method: 'DELETE' })
  },
  categories: {
    getAll: () => apiCall('medicine-categories')
  },
  suppliers: {
    getAll: () => apiCall('medicine-suppliers')
  }
};

// ===================================
// GROCERY API
// ===================================

export const groceryAPI = {
  products: {
    getAll: () => apiCall('grocery-products'),
    getById: (id) => apiCall(`grocery-products/${id}`),
    create: (data) => apiCall('grocery-products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`grocery-products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`grocery-products/${id}`, { method: 'DELETE' })
  },
  categories: {
    getAll: () => apiCall('grocery-categories')
  },
  suppliers: {
    getAll: () => apiCall('grocery-suppliers')
  }
};

// ===================================
// LEADS API
// ===================================

export const leadsAPI = {
  getAll: () => apiCall('leads'),
  getById: (id) => apiCall(`leads/${id}`),
  create: (data) => apiCall('leads', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`leads/${id}`, { method: 'DELETE' }),
  categories: {
    getAll: () => apiCall('lead-categories')
  }
};

// ===================================
// PATIENT HISTORY & MEDICAL RECORDS
// ===================================

export const medicalAPI = {
  patientHistory: {
    getAll: () => apiCall('patient-history'),
    getById: (id) => apiCall(`patient-history/${id}`),
    create: (data) => apiCall('patient-history', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`patient-history/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`patient-history/${id}`, { method: 'DELETE' })
  },
  records: {
    getAll: () => apiCall('medical-records'),
    getById: (id) => apiCall(`medical-records/${id}`),
    create: (data) => apiCall('medical-records', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`medical-records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`medical-records/${id}`, { method: 'DELETE' })
  }
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Test connection to the backend server
 */
export async function testConnection() {
  try {
    const response = await apiCall('health');
    console.log('🎉 Backend connection successful!');
    return response;
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    throw error;
  }
}

/**
 * Load and apply website settings (for App.tsx)
 */
export async function loadWebsiteSettings() {
  try {
    const settings = await settingsAPI.getAll();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      if (setting.file_path) {
        acc[`${setting.setting_key}_file_path`] = setting.file_path;
      }
      return acc;
    }, {});

    console.log('🎯 Loading website settings from database...');

    // Apply website title
    if (settingsMap.website_title) {
      document.title = settingsMap.website_title;
      console.log('✅ Website title set from database:', settingsMap.website_title);
    }

    // Apply favicon from database using direct API call
    try {
      console.log('🔧 Loading favicon from database...');
      const faviconResponse = await fetch(`${API_BASE_URL}/settings/favicon`);
      
      if (faviconResponse.ok) {
        const faviconData = await faviconResponse.json();
        
        if (faviconData.success && faviconData.faviconUrl) {
          // Remove existing favicon links
          const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
          existingFavicons.forEach(link => link.remove());
          
          // Build full URL for favicon
          const fullFaviconUrl = faviconData.faviconUrl.startsWith('/') 
            ? `${API_BASE_URL.replace('/api', '')}${faviconData.faviconUrl}`
            : faviconData.faviconUrl;
          
          // Add cache busting
          const timestamp = Date.now();
          const faviconUrlWithCache = `${fullFaviconUrl}?v=${timestamp}`;
          
          // Create and add new favicon links
          const favicon = document.createElement('link');
          favicon.rel = 'icon';
          favicon.type = 'image/x-icon';
          favicon.href = faviconUrlWithCache;
          document.head.appendChild(favicon);
          
          const shortcutIcon = document.createElement('link');
          shortcutIcon.rel = 'shortcut icon';
          shortcutIcon.type = 'image/x-icon';
          shortcutIcon.href = faviconUrlWithCache;
          document.head.appendChild(shortcutIcon);
          
          const appleTouchIcon = document.createElement('link');
          appleTouchIcon.rel = 'apple-touch-icon';
          appleTouchIcon.href = faviconUrlWithCache;
          document.head.appendChild(appleTouchIcon);
          
          console.log('✅ Favicon loaded from database successfully:', faviconData.faviconUrl);
        } else {
          console.log('⚠️ No favicon found in database, using fallback');
          // Fallback to static favicon if database doesn't have one
          applyFallbackFavicon();
        }
      } else {
        console.log('⚠️ Failed to fetch favicon from database, using fallback');
        applyFallbackFavicon();
      }
    } catch (faviconError) {
      console.error('❌ Error loading favicon from database:', faviconError);
      applyFallbackFavicon();
    }

    return settingsMap;
  } catch (error) {
    console.error('❌ Error loading website settings:', error);
    throw error;
  }
}

// Fallback function for static favicon
function applyFallbackFavicon() {
  console.log('🔄 Applying fallback favicon...');
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = '/favicon.ico?v=1.0';
  console.log('✅ Fallback favicon applied');
}

// ===================================
// EXPORT DEFAULT
// ===================================

export default {
  config: API_CONFIG,
  call: apiCall,
  settings: settingsAPI,
  patients: patientsAPI,
  users: usersAPI,
  roles: rolesAPI,
  doctors: doctorsAPI,
  staff: staffAPI,
  medicine: medicineAPI,
  grocery: groceryAPI,
  leads: leadsAPI,
  medical: medicalAPI,
  testConnection,
  loadWebsiteSettings
};
