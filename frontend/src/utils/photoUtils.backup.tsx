import React, { useState, useEffect, useMemo } from 'react';

// Photo URL utility function for robust image handling
export const getPatientPhotoUrl = (photoPath: string): string => {
  // Return empty string for null/undefined/empty paths
  if (!photoPath || photoPath.trim() === '' || photoPath === 'null' || photoPath === null || photoPath === undefined) {
    return '';
  }
  
  // If it's already a data URL (base64), return as-is
  if (photoPath.startsWith('data:')) {
    return photoPath;
  }
  
  // If it's already a full HTTP URL, return as-is
  if (photoPath.startsWith('http')) {
    return photoPath;
  }
  
  // Clean the path - convert ALL backslashes to forward slashes and normalize
  let cleanPath = photoPath.replace(/\\/g, '/'); // Convert backslashes to forward slashes
  cleanPath = cleanPath.replace(/\/+/g, '/'); // Replace multiple slashes with single slash
  
  // Fix duplicated Photos/ prefix issue - if path has "Photos/Photos/", remove the duplicate
  if (cleanPath.includes('Photos/Photos/')) {
    console.log('⚠️ Detected duplicated Photos/ prefix in path:', cleanPath);
    cleanPath = cleanPath.replace('Photos/Photos/', 'Photos/');
    console.log('✅ Fixed duplicated Photos/ prefix to:', cleanPath);
  }
  
  // Ensure path starts with Photos/ for consistency (only if it doesn't already have it)
  if (!cleanPath.startsWith('Photos/') && !cleanPath.startsWith('/Photos/')) {
    // If path doesn't start with Photos/, add it
    if (cleanPath.startsWith('/')) {
      cleanPath = `Photos${cleanPath}`;
    } else {
      cleanPath = `Photos/${cleanPath}`;
    }
  }
  
  // If path already starts with Photos/, construct full URL to backend
  if (cleanPath.startsWith('Photos/')) {
    // Use only .env value, no fallback
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
    // Add aggressive cache buster to force reload with timestamp and random value
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const cacheBuster = `?t=${timestamp}&r=${random}`;
    return `${backendUrl}/${cleanPath.replace(/\s/g, '%20')}${cacheBuster}`;
  }
  
  // If path starts with /Photos/, construct full URL to backend  
  if (cleanPath.startsWith('/Photos/')) {
    // Use only .env value, no fallback
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const cacheBuster = `?t=${timestamp}&r=${random}`;
    return `${backendUrl}${cleanPath.replace(/\s/g, '%20')}${cacheBuster}`;
  }
  
  // Handle backend file paths
  if (cleanPath.startsWith('/uploads/')) {
    // Use only .env value, no fallback
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const cacheBuster = `?t=${timestamp}&r=${random}`;
    return `${backendUrl}${cleanPath}${cacheBuster}`;
  }
  
  // For paths that are just filenames or don't match our patterns
  // This is a fallback - try to serve from backend
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  
  // Use only .env value, no fallback
  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const cacheBuster = `?t=${timestamp}&r=${random}`;
  return `${backendUrl}${cleanPath}${cacheBuster}`;
};

// Certificate photo URL utility function (similar to patient photos)
export const getCertificatePhotoUrl = (photoPath: string): string => {
  // Return empty string for null/undefined/empty paths
  if (!photoPath || photoPath.trim() === '' || photoPath === 'null' || photoPath === null || photoPath === undefined) {
    return '';
  }
  
  // If it's already a data URL (base64), return as-is
  if (photoPath.startsWith('data:')) {
    return photoPath;
  }
  
  // If it's already a full HTTP URL, return as-is
  if (photoPath.startsWith('http')) {
    return photoPath;
  }
  
  // Clean the path - convert ALL backslashes to forward slashes and normalize
  let cleanPath = photoPath.replace(/\\/g, '/'); // Convert backslashes to forward slashes
  cleanPath = cleanPath.replace(/\/+/g, '/'); // Replace multiple slashes with single slash
  
  // Fix duplicated Photos/ prefix issue
  if (cleanPath.includes('Photos/Photos/')) {
    cleanPath = cleanPath.replace('Photos/Photos/', 'Photos/');
  }
  
  // Ensure path starts with Photos/ for consistency
  if (!cleanPath.startsWith('Photos/') && !cleanPath.startsWith('/Photos/')) {
    if (cleanPath.startsWith('/')) {
      cleanPath = `Photos${cleanPath}`;
    } else {
      cleanPath = `Photos/${cleanPath}`;
    }
  }
  
  // If path already starts with Photos/, construct full URL to backend
  if (cleanPath.startsWith('Photos/')) {
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const cacheBuster = `?t=${timestamp}&r=${random}`;
    return `${backendUrl}/${cleanPath.replace(/\s/g, '%20')}${cacheBuster}`;
  }
  
  // If path starts with /Photos/, construct full URL to backend  
  if (cleanPath.startsWith('/Photos/')) {
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const cacheBuster = `?t=${timestamp}&r=${random}`;
    return `${backendUrl}${cleanPath.replace(/\s/g, '%20')}${cacheBuster}`;
  }
  
  // Handle backend file paths
  if (cleanPath.startsWith('/uploads/')) {
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const cacheBuster = `?t=${timestamp}&r=${random}`;
    return `${backendUrl}${cleanPath}${cacheBuster}`;
  }
  
  // For paths that are just filenames or don't match our patterns
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  
  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const cacheBuster = `?t=${timestamp}&r=${random}`;
  return `${backendUrl}${cleanPath}${cacheBuster}`;
};

// Enhanced image component with error handling and forced refresh capability
export const PatientPhoto = ({ 
  photoPath, 
  className = "w-10 h-10 rounded-full border-2 border-gray-200", 
  alt = "Patient photo",
  style = {},
  onError = null,
  showRefreshButton = false,
  size = "w-10 h-10"
}: {
  photoPath: string;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
  onError?: ((e: React.SyntheticEvent<HTMLImageElement, Event>) => void) | null;
  showRefreshButton?: boolean;
  size?: string;
}) => {
  const [currentPhotoPath, setCurrentPhotoPath] = useState(photoPath);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get the processed photo URL
  const photoUrl = useMemo(() => {
    if (!currentPhotoPath) return '';
    return getPatientPhotoUrl(currentPhotoPath);
  }, [currentPhotoPath, refreshKey]);

  // Update photo path when prop changes
  useEffect(() => {
    setCurrentPhotoPath(photoPath);
    setImageError(false);
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
  }, [photoPath]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('❌ Image failed to load:', photoUrl);
    setImageError(true);
    setIsLoading(false);
    if (onError) {
      onError(e);
    }
  };

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', photoUrl);
    setImageError(false);
    setIsLoading(false);
  };

  const refreshImage = () => {
    console.log('🔄 Manually refreshing image:', photoUrl);
    setRefreshKey(prev => prev + 1);
    setImageError(false);
    setIsLoading(true);
  };

  // If no photo path provided
  if (!currentPhotoPath || currentPhotoPath.trim() === '') {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 text-gray-400`} style={style}>
        <span className="text-xs">No Photo</span>
      </div>
    );
  }

  // If image failed to load
  if (imageError) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-gray-100 text-gray-400 relative`} style={style}>
        <span className="text-xs">Failed</span>
        {showRefreshButton && (
          <button 
            onClick={refreshImage}
            className="absolute top-0 right-0 bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
            title="Refresh image"
          >
            ↻
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} flex items-center justify-center bg-gray-100 text-gray-400`} style={style}>
          <span className="text-xs">Loading...</span>
        </div>
      )}
      <img
        src={photoUrl}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''} object-cover`}
        style={style}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
      {showRefreshButton && !isLoading && !imageError && (
        <button 
          onClick={refreshImage}
          className="absolute top-0 right-0 bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
          title="Refresh image"
        >
          ↻
        </button>
      )}
    </div>
  );
};

// Staff photo utility - same as patient but with different default paths
export const getStaffPhotoUrl = (photoPath: string): string => {
  // Return empty string for null/undefined/empty paths
  if (!photoPath || photoPath.trim() === '' || photoPath === 'null' || photoPath === null || photoPath === undefined) {
    return '';
  }
  
  // If it's already a data URL (base64), return as-is
  if (photoPath.startsWith('data:')) {
    return photoPath;
  }
  
  // If it's already a full HTTP URL, return as-is
  if (photoPath.startsWith('http')) {
    return photoPath;
  }
  
  // Clean the path - convert ALL backslashes to forward slashes and normalize
  let cleanPath = photoPath.replace(/\\/g, '/'); // Convert backslashes to forward slashes
  cleanPath = cleanPath.replace(/\/+/g, '/'); // Replace multiple slashes with single slash
  
  // Fix duplicated Photos/ prefix issue - if path has "Photos/Photos/", remove the duplicate
  if (cleanPath.includes('Photos/Photos/')) {
    console.log('⚠️ Detected duplicated Photos/ prefix in path:', cleanPath);
    cleanPath = cleanPath.replace('Photos/Photos/', 'Photos/');
    console.log('✅ Fixed duplicated Photos/ prefix to:', cleanPath);
  }
  
  // Ensure path starts with Photos/ for consistency (only if it doesn't already have it)
  if (!cleanPath.startsWith('Photos/') && !cleanPath.startsWith('/Photos/')) {
    // If path doesn't start with Photos/, add it
    if (cleanPath.startsWith('/')) {
      cleanPath = `Photos${cleanPath}`;
    } else {
      cleanPath = `Photos/${cleanPath}`;
    }
  }
  
  // If path already starts with Photos/, construct full URL to backend
  if (cleanPath.startsWith('Photos/')) {
    // Use only .env value, no fallback
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
    // Add aggressive cache buster to force reload with timestamp and random value
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const cacheBuster = `?t=${timestamp}&r=${random}`;
    return `${backendUrl}/${cleanPath.replace(/\s/g, '%20')}${cacheBuster}`;
  }
  
  // If path starts with /Photos/, construct full URL to backend  
  if (cleanPath.startsWith('/Photos/')) {
    // Use only .env value, no fallback
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const cacheBuster = `?t=${timestamp}&r=${random}`;
    return `${backendUrl}${cleanPath.replace(/\s/g, '%20')}${cacheBuster}`;
  }
  
  // Handle backend file paths
  if (cleanPath.startsWith('/uploads/')) {
    // Use only .env value, no fallback
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const cacheBuster = `?t=${timestamp}&r=${random}`;
    return `${backendUrl}${cleanPath}${cacheBuster}`;
  }
  
  // For paths that are just filenames or don't match our patterns
  // This is a fallback - try to serve from backend
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  
  // Use only .env value, no fallback
  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const cacheBuster = `?t=${timestamp}&r=${random}`;
  return `${backendUrl}${cleanPath}${cacheBuster}`;
};

// Generic photo URL function that can be used for any type of photo
export const getPhotoUrl = (photoPath: string): string => {
  return getPatientPhotoUrl(photoPath); // Same logic for all photo types
};

export default { getPatientPhotoUrl, getStaffPhotoUrl, getPhotoUrl, PatientPhoto };
