// Types for logo service
interface LogoCacheEntry {
  url: string;
  timestamp: number;
}

interface LogoResponse {
  success: boolean;
  logoUrl: string;
  timestamp: string;
}

// Service to fetch and manage sidebar logo from database
class LogoService {
  private baseURL: string;
  private cache: Map<string, LogoCacheEntry>;
  private cacheExpiry: number;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL;
    this.cache = new Map<string, LogoCacheEntry>();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async fetchLogoFromDB(): Promise<string> {
    try {
      console.log('🎯 Fetching sidebar logo from database...');
      
      // Check cache first
      const cached = this.cache.get('logo');
      if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
        console.log('✅ Using cached logo URL:', cached.url);
        return cached.url;
      }

      const response = await fetch(`${this.baseURL}/settings/sidebar_logo`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logo: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.value || data.setting_value) {
        let logoPath = data.value || data.setting_value;
        
        // Convert absolute Windows path to web-accessible relative path
        if (logoPath.includes('\\Photos\\settings\\')) {
          // Extract the filename from the absolute path
          const filename = logoPath.split('\\').pop();
          logoPath = `/Photos/settings/${filename}`;
        } else if (!logoPath.startsWith('/')) {
          // If it's not already a web path, assume it's in the Photos directory
          logoPath = `/Photos/settings/${logoPath}`;
        }
        
        // Cache the result
        this.cache.set('logo', {
          url: logoPath,
          timestamp: Date.now()
        });
        
        console.log('✅ Logo fetched from database:', logoPath);
        return logoPath;
      } else {
        throw new Error('No logo found in database');
      }
      
    } catch (error) {
      console.error('❌ Error fetching logo from database:', error);
      // Return null for fallback handling
      return '';
    }
  }

  async getLogoUrl(): Promise<string> {
    try {
      const logoPath = await this.fetchLogoFromDB();
      
      if (!logoPath) {
        return '';
      }

      // Build full URL - handle both API URL formats
      let fullLogoUrl;
      if (logoPath.startsWith('/')) {
        // Remove /api from baseURL if it exists
        const baseWithoutApi = this.baseURL.replace('/api', '');
        fullLogoUrl = `${baseWithoutApi}${logoPath}`;
      } else {
        fullLogoUrl = logoPath;
      }

      console.log('🔧 Logo URL:', fullLogoUrl);
      return fullLogoUrl;
      
    } catch (error) {
      console.error('❌ Error getting logo URL:', error);
      return '';
    }
  }

  // Force refresh logo (useful for admin panel)
  async forceRefresh(): Promise<string> {
    console.log('🔄 Force refreshing logo from database...');
    this.cache.clear();
    return await this.getLogoUrl();
  }
}

// Export singleton instance
export const logoService = new LogoService();
export default logoService;
