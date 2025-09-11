import { useEffect, useState } from 'react';
import { logoService } from '../services/logoService';

export const useLogoFromDB = () => {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        console.log('🎯 Loading sidebar logo from database via React hook...');
        setError(null);
        
        // First check sessionStorage for immediately available logo
        const cachedLogoUrl = sessionStorage.getItem('sidebar_logo_url');
        const cachedLogoLoaded = sessionStorage.getItem('sidebar_logo_loaded');
        
        if (cachedLogoLoaded === 'true' && cachedLogoUrl) {
          console.log('✅ Using cached logo from sessionStorage:', cachedLogoUrl);
          setLogoUrl(cachedLogoUrl);
          setLogoLoaded(true);
          return;
        } else if (cachedLogoLoaded === 'false') {
          console.log('⚠️ No logo available (cached negative result)');
          setLogoLoaded(false);
          return;
        }
        
        // Fallback to API call if nothing in cache
        const url = await logoService.getLogoUrl();
        if (url) {
          setLogoUrl(url);
          setLogoLoaded(true);
          // Update cache
          sessionStorage.setItem('sidebar_logo_url', url);
          sessionStorage.setItem('sidebar_logo_loaded', 'true');
          console.log('✅ Logo loaded from database successfully via React hook');
        } else {
          console.log('⚠️ No logo found in database');
          sessionStorage.setItem('sidebar_logo_loaded', 'false');
          setLogoLoaded(false);
        }
      } catch (err) {
        console.error('❌ Error loading logo from database via React hook:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        sessionStorage.setItem('sidebar_logo_loaded', 'false');
        setLogoLoaded(false);
      }
    };

    // Load logo immediately
    loadLogo();
  }, []);

  const refreshLogo = async () => {
    console.log('🔄 Manually refreshing logo...');
    try {
      setError(null);
      
      // Clear sessionStorage cache
      sessionStorage.removeItem('sidebar_logo_url');
      sessionStorage.removeItem('sidebar_logo_loaded');
      
      const url = await logoService.forceRefresh();
      if (url) {
        setLogoUrl(url);
        setLogoLoaded(true);
        // Update cache
        sessionStorage.setItem('sidebar_logo_url', url);
        sessionStorage.setItem('sidebar_logo_loaded', 'true');
        console.log('✅ Logo refreshed successfully');
      } else {
        console.log('⚠️ No logo found after refresh');
        sessionStorage.setItem('sidebar_logo_loaded', 'false');
        setLogoLoaded(false);
      }
      return true;
    } catch (err) {
      console.error('❌ Error refreshing logo:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      sessionStorage.setItem('sidebar_logo_loaded', 'false');
      setLogoLoaded(false);
      return false;
    }
  };

  return {
    logoLoaded,
    logoUrl,
    error,
    refreshLogo
  };
};
