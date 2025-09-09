import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'lucide-react';

// ⚡ OPTIMIZED PHOTO URL GENERATOR WITH SMART CACHING ⚡
export const getPatientPhotoUrl = (photoPath: string): string => {
  // Return empty string for null/undefined/empty paths
  if (!photoPath || photoPath.trim() === '' || photoPath === 'null' || photoPath === null || photoPath === undefined) {
    return '';
  }

  // Clean and normalize the path
  let cleanPath = photoPath.trim().replace(/\\/g, '/');
  
  // Ensure path starts with forward slash
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  
  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
  
  // ⚡ OPTIMIZED: Only add cache busting in development or for refresh
  // In production, let browser cache handle it for better performance
  const isDevelopment = import.meta.env.DEV;
  const shouldCacheBust = isDevelopment && cleanPath.includes('refresh=true');
  
  if (shouldCacheBust) {
    const timestamp = Date.now();
    const cacheBuster = `?t=${timestamp}`;
    return `${backendUrl}${cleanPath}${cacheBuster}`;
  }
  
  return `${backendUrl}${cleanPath}`;
};

// ⚡ ULTRA-FAST PATIENT PHOTO COMPONENT ⚡
// Optimized for instant loading in tables with minimal state management
export const PatientPhoto = ({ 
  photoPath, 
  className = "w-10 h-10 rounded-full border-2 border-gray-200", 
  alt = "Patient photo",
  style = {},
  onError = null,
  showRefreshButton = false
}: {
  photoPath: string;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
  onError?: ((e: React.SyntheticEvent<HTMLImageElement, Event>) => void) | null;
  showRefreshButton?: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // ⚡ Start as false for instant display
  const [refreshKey, setRefreshKey] = useState(0);

  // Get the processed photo URL - memoized for performance
  const photoUrl = useMemo(() => {
    if (!photoPath || photoPath.trim() === '') return '';
    return getPatientPhotoUrl(photoPath);
  }, [photoPath, refreshKey]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('⚠️ Image failed to load:', photoUrl);
    setImageError(true);
    setIsLoading(false);
    if (onError) {
      onError(e);
    }
  };

  const handleImageLoad = () => {
    setImageError(false);
    setIsLoading(false);
  };

  const refreshImage = () => {
    console.log('🔄 Refreshing image:', photoUrl);
    setRefreshKey(prev => prev + 1);
    setImageError(false);
    setIsLoading(true);
  };

  // If no photo path provided, show user icon
  if (!photoPath || photoPath.trim() === '') {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 border border-blue-200`} style={style}>
        <User className="w-4 h-4" />
      </div>
    );
  }

  // If image failed to load, show fallback
  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500 border border-gray-200 relative`} style={style}>
        <User className="w-4 h-4" />
        {showRefreshButton && (
          <button 
            onClick={refreshImage}
            className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-blue-600 transition-colors"
            title="Retry loading image"
          >
            ↻
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ⚡ OPTIMIZED: Minimal loading state */}
      {isLoading && (
        <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 animate-pulse`} style={style}>
          <div className="w-4 h-4 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin"></div>
        </div>
      )}
      
      {/* ⚡ CRITICAL: Pre-load images with immediate display */}
      <img
        src={photoUrl}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''} object-cover transition-opacity duration-200`}
        style={style}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="eager" // ⚡ CRITICAL: Load immediately for table photos
        decoding="async" // ⚡ PERFORMANCE: Async decoding for faster display
      />
      
      {showRefreshButton && !isLoading && !imageError && (
        <button 
          onClick={refreshImage}
          className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-blue-600 transition-colors"
          title="Refresh image"
        >
          ↻
        </button>
      )}
    </div>
  );
};

// Certificate photo utility - same optimizations
export const getCertificatePhotoUrl = (photoPath: string): string => {
  return getPatientPhotoUrl(photoPath); // Same logic applies
};

// Staff photo utility - same optimizations  
export const getStaffPhotoUrl = (photoPath: string): string => {
  return getPatientPhotoUrl(photoPath); // Same logic applies
};
