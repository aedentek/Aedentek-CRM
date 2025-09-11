import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Get configuration from environment variables with fallbacks
  const apiUrl = env.VITE_API_URL || 'http://localhost:4000/api';
  const baseUrl = env.VITE_BASE_URL || 'http://localhost:8080';
  
  // Remove '/api' from the target since it's already in VITE_API_URL
  const proxyTarget = apiUrl.replace('/api', '');
  
  // Extract host and port from VITE_BASE_URL for development server
  let devHost = 'localhost';
  let devPort = 8080;
  
  try {
    if (baseUrl) {
      const url = new URL(baseUrl);
      devHost = url.hostname || 'localhost';
      devPort = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 8080);
    }
  } catch (error) {
    console.warn('⚠️ Invalid VITE_BASE_URL, using defaults:', error instanceof Error ? error.message : 'Unknown error');
    devHost = 'localhost';
    devPort = 8080;
  }
  
  console.log('🔧 Vite Configuration:');
  console.log('📍 Development Server:', `${devHost}:${devPort}`);
  console.log('🔗 API Target:', proxyTarget);
  console.log('🌐 Environment Mode:', mode);
  
  return {
    server: {
      host: devHost,
      port: devPort,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            console.log('🔄 Proxy configured for /api ->', proxyTarget);
          }
        },
        '/Photos': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            console.log('📸 Proxy configured for /Photos ->', proxyTarget);
          }
        }
      }
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            // Vendor chunks
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-checkbox'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-icons': ['lucide-react'],
            
            // Feature-based chunks
            'patients': [
              './src/components/patients/AddPatient.tsx',
              './src/components/patients/PatientList.tsx',
              './src/components/patients/PatientBiodata.tsx',
              './src/components/patients/PatientHistory.tsx',
              './src/components/patients/PatientAttendance.tsx',
              './src/components/patients/PatientMedicalRecord.tsx',
              './src/components/patients/PatientPaymentFees.tsx',
              './src/components/patients/PatientFullyHistory.tsx',
              './src/components/patients/DeletedPatients.tsx'
            ],
            'management-staff': [
              './src/components/management/StaffManagement.tsx',
              './src/components/management/AddStaff.tsx',
              './src/components/management/StaffCategory.tsx',
              './src/components/management/DeletedStaff.tsx',
              './src/components/management/AttendanceManagement.tsx',
              './src/components/management/SalaryPayment.tsx'
            ],
            'management-doctor': [
              './src/components/management/DoctorManagement.tsx',
              './src/components/management/AddDoctor.tsx',
              './src/components/management/DoctorCategory.tsx',
              './src/components/management/DeletedDoctors.tsx',
              './src/components/management/DoctorAttendance.tsx',
              './src/components/management/DoctorSalary.tsx'
            ],
            'management-medicine': [
              './src/components/management/MedicineManagement.tsx',
              './src/components/management/MedicineCategories.tsx',
              './src/components/management/MedicineStock.tsx',
              './src/components/management/MedicineAccounts.tsx'
            ],
            'management-grocery': [
              './src/components/management/GroceryManagement.tsx',
              './src/components/management/GroceryCategories.tsx',
              './src/components/management/GrocerySuppliers.tsx',
              './src/components/management/GroceryStock.tsx',
              './src/components/management/GroceryAccounts.tsx'
            ],
            'management-general': [
              './src/components/management/GeneralManagement.tsx',
              './src/components/management/GeneralCategories.tsx',
              './src/components/management/GeneralSuppliers.tsx',
              './src/components/management/GeneralStock.tsx',
              './src/components/management/GeneralAccounts.tsx'
            ]
          }
        }
      },
      copyPublicDir: true,
      // Increase chunk size warning limit since we're using code splitting
      chunkSizeWarningLimit: 1000,
    },
    publicDir: 'public',
  };
});
