// Types for favicon service
interface FaviconCacheEntry {
  url: string;
  timestamp: number;
}

interface FaviconResponse {
  success: boolean;
  faviconUrl: string;
  timestamp: string;
}

interface SettingResponse {
  key: string;
  value: string;
}

// Service to fetch and set favicon from database
class FaviconService {
  private baseURL: string;
  private cache: Map<string, FaviconCacheEntry>;
  private cacheExpiry: number;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL;
    this.cache = new Map<string, FaviconCacheEntry>();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async fetchFaviconFromDB(): Promise<string> {
    try {
      console.log('🎯 Fetching favicon from database...');
      
      // Check cache first
      const cached = this.cache.get('favicon');
      if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
        console.log('✅ Using cached favicon URL:', cached.url);
        return cached.url;
      }

      const response = await fetch(`${this.baseURL}/favicon`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch favicon: ${response.status}`);
      }
      
      const data: FaviconResponse = await response.json();
      
      if (data.success && data.faviconUrl) {
        // Cache the result
        this.cache.set('favicon', {
          url: data.faviconUrl,
          timestamp: Date.now()
        });
        
        console.log('✅ Favicon fetched from database:', data.faviconUrl);
        return data.faviconUrl;
      } else {
        throw new Error('Invalid favicon response from database');
      }
      
    } catch (error) {
      console.error('❌ Error fetching favicon from database:', error);
      // Fallback to default favicon
      return '/favicon.ico';
    }
  }

  async setFaviconFromDB(): Promise<boolean> {
    try {
      const faviconUrl = await this.fetchFaviconFromDB();
      
      // Build full URL - handle both API URL formats
      let fullFaviconUrl;
      if (faviconUrl.startsWith('/')) {
        // Remove /api from baseURL if it exists
        const baseWithoutApi = this.baseURL.replace('/api', '');
        fullFaviconUrl = `${baseWithoutApi}${faviconUrl}`;
      } else {
        fullFaviconUrl = faviconUrl;
      }

      console.log('🔧 Setting favicon to:', fullFaviconUrl);
      console.log('🔧 Base URL:', this.baseURL);
      console.log('🔧 Favicon URL from DB:', faviconUrl);
      
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      console.log('🗑️ Removing existing favicon links:', existingFavicons.length);
      existingFavicons.forEach(link => link.remove());
      
      // Add new favicon links with cache busting
      const timestamp = Date.now();
      
      // Standard favicon
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/x-icon';
      favicon.href = `${fullFaviconUrl}?v=${timestamp}`;
      document.head.appendChild(favicon);
      console.log('✅ Added standard favicon link:', favicon.href);
      
      // Shortcut icon
      const shortcutIcon = document.createElement('link');
      shortcutIcon.rel = 'shortcut icon';
      shortcutIcon.type = 'image/x-icon';
      shortcutIcon.href = `${fullFaviconUrl}?v=${timestamp}`;
      document.head.appendChild(shortcutIcon);
      console.log('✅ Added shortcut icon link:', shortcutIcon.href);
      
      // Apple touch icon
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = `${fullFaviconUrl}?v=${timestamp}`;
      document.head.appendChild(appleTouchIcon);
      console.log('✅ Added apple-touch-icon link:', appleTouchIcon.href);
      
      console.log('✅ Database favicon set successfully!');
      
      // Update page title from database if available
      this.updatePageTitleFromDB();
      
      return true;
      
    } catch (error) {
      console.error('❌ Error setting favicon from database:', error);
      return false;
    }
  }

  async updatePageTitleFromDB(): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/settings/website_title`);
      if (response.ok) {
        const data: SettingResponse = await response.json();
        if (data.value) {
          document.title = data.value;
          console.log('✅ Page title updated from database:', data.value);
        }
      }
    } catch (error) {
      console.error('❌ Error updating page title from database:', error);
    }
  }

  // Auto-refresh favicon periodically
  startAutoRefresh(intervalMinutes: number = 5): void {
    const interval = intervalMinutes * 60 * 1000;
    
    setInterval(async () => {
      console.log('🔄 Auto-refreshing favicon from database...');
      await this.setFaviconFromDB();
    }, interval);
    
    console.log(`🔄 Auto-refresh enabled: every ${intervalMinutes} minutes`);
  }

  // Force refresh favicon (useful for admin panel)
  async forceRefresh(): Promise<boolean> {
    console.log('🔄 Force refreshing favicon from database...');
    this.cache.clear();
    return await this.setFaviconFromDB();
  }
}

// Export singleton instance
export const faviconService = new FaviconService();
export default faviconService;
