import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSkeletonProps {
  type?: 'page' | 'table' | 'form' | 'dashboard';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'page' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'table':
        return (
          <div className="space-y-4 p-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            
            {/* Search bar skeleton */}
            <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
            
            {/* Table header skeleton */}
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            
            {/* Table rows skeleton */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ))}
          </div>
        );
        
      case 'form':
        return (
          <div className="space-y-6 p-6 max-w-2xl mx-auto">
            {/* Form title skeleton */}
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            
            {/* Form fields skeleton */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-100 rounded w-full animate-pulse"></div>
              </div>
            ))}
            
            {/* Button skeleton */}
            <div className="flex gap-4">
              <div className="h-10 bg-blue-200 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        );
        
      case 'dashboard':
        return (
          <div className="space-y-6 p-6">
            {/* Dashboard title skeleton */}
            <div className="h-10 bg-gray-200 rounded w-80 animate-pulse"></div>
            
            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-8 bg-gray-300 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded w-24 animate-pulse"></div>
                </div>
              ))}
            </div>
            
            {/* Charts skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-4"></div>
                  <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        );
        
      default: // page
        return (
          <div className="space-y-6 p-6">
            {/* Page title skeleton */}
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            
            {/* Content blocks skeleton */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-3 text-blue-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm font-medium">Loading page...</span>
        </div>
      </div>
      {renderSkeleton()}
    </div>
  );
};

export default LoadingSkeleton;
