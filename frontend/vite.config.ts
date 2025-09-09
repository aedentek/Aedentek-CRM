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
      },
      copyPublicDir: true,
    },
    publicDir: 'public',
  };
});
