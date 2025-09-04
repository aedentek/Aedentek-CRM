import React from 'react';
import { useFaviconFromDB } from '../hooks/useFaviconFromDB';

interface DatabaseFaviconProps {
  autoRefresh?: boolean;
  onLoad?: (faviconUrl: string) => void;
  onError?: (error: string) => void;
}

export const DatabaseFavicon: React.FC<DatabaseFaviconProps> = ({ 
  autoRefresh = true, 
  onLoad, 
  onError 
}) => {
  const { faviconLoaded, faviconUrl, error, refreshFavicon } = useFaviconFromDB(autoRefresh);

  React.useEffect(() => {
    if (faviconLoaded && faviconUrl && onLoad) {
      onLoad(faviconUrl);
    }
  }, [faviconLoaded, faviconUrl, onLoad]);

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // This component doesn't render anything visible
  // It just manages the favicon in the background
  return null;
};

export default DatabaseFavicon;
