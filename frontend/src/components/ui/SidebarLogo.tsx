import React from 'react';
import { useLogoFromDB } from '@/hooks/useLogoFromDB';

interface SidebarLogoProps {
  className?: string;
  fallbackInitials?: string;
}

export const SidebarLogo: React.FC<SidebarLogoProps> = ({ 
  className = "h-12 w-12", 
  fallbackInitials = "GB" 
}) => {
  const { logoLoaded, logoUrl, error } = useLogoFromDB();

  React.useEffect(() => {
    if (logoLoaded && logoUrl) {
      console.log('🎨 SidebarLogo component: Logo loaded successfully:', logoUrl);
    } else if (error) {
      console.warn('🎨 SidebarLogo component: Logo loading failed:', error);
    }
  }, [logoLoaded, logoUrl, error]);

  if (logoLoaded && logoUrl) {
    return (
      <div className={`${className} relative`}>
        <img
          src={logoUrl}
          alt="Company Logo"
          className="w-full h-full object-contain rounded-full bg-white p-1"
          onError={(e) => {
            console.warn('🎨 Logo image failed to load, hiding element');
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Fallback when image fails to load */}
        <div className="absolute inset-0 flex items-center justify-center bg-blue-600 text-white font-semibold rounded-full opacity-0 hover:opacity-100 transition-opacity">
          {fallbackInitials}
        </div>
      </div>
    );
  }

  // Show fallback when no logo is available
  return (
    <div className={`${className} bg-blue-600 text-white font-semibold rounded-full flex items-center justify-center`}>
      {fallbackInitials}
    </div>
  );
};

export default SidebarLogo;
