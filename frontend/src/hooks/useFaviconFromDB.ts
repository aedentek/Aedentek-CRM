import { useEffect, useState } from 'react';
import { faviconService } from '../services/faviconService';

export const useFaviconFromDB = (autoRefresh = true) => {
  const [faviconLoaded, setFaviconLoaded] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFavicon = async () => {
      try {
        console.log('🎯 Loading favicon from database...');
        setError(null);
        
        // Add a small delay to ensure backend is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const success = await faviconService.setFaviconFromDB();
        if (success) {
          const url = await faviconService.fetchFaviconFromDB();
          setFaviconUrl(url);
          setFaviconLoaded(true);
          console.log('✅ Favicon loaded from database successfully');
        } else {
          throw new Error('Failed to set favicon from database');
        }
      } catch (err) {
        console.error('❌ Error loading favicon from database:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setFaviconLoaded(false);
      }
    };

    // Load favicon immediately
    loadFavicon();

    // Start auto-refresh if enabled
    if (autoRefresh) {
      faviconService.startAutoRefresh(5); // Refresh every 5 minutes
    }

    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [autoRefresh]);

  const refreshFavicon = async () => {
    console.log('🔄 Manually refreshing favicon...');
    try {
      setError(null);
      const success = await faviconService.forceRefresh();
      if (success) {
        const url = await faviconService.fetchFaviconFromDB();
        setFaviconUrl(url);
        setFaviconLoaded(true);
        console.log('✅ Favicon refreshed successfully');
        return true;
      } else {
        throw new Error('Failed to refresh favicon');
      }
    } catch (err) {
      console.error('❌ Error refreshing favicon:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  return {
    faviconLoaded,
    faviconUrl,
    error,
    refreshFavicon
  };
};
