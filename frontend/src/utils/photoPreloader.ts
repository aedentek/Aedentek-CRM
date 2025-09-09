// ⚡ PHOTO PRELOADER SERVICE FOR INSTANT LOADING ⚡
// This service preloads all patient photos in the background for instant display

class PhotoPreloaderService {
  private preloadedImages = new Map<string, HTMLImageElement>();
  private preloadQueue = new Set<string>();
  private isPreloading = false;

  // Preload a single image and cache it
  preloadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (this.preloadedImages.has(url)) {
        resolve(this.preloadedImages.get(url)!);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.preloadedImages.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn('⚠️ Failed to preload image:', url);
        reject(new Error(`Failed to preload image: ${url}`));
      };
      img.src = url;
    });
  }

  // Preload multiple images in batches
  async preloadPhotos(urls: string[], batchSize = 5): Promise<void> {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    console.log(`🚀 Preloading ${urls.length} photos in batches of ${batchSize}...`);

    // Filter out already preloaded images
    const newUrls = urls.filter(url => !this.preloadedImages.has(url));
    
    if (newUrls.length === 0) {
      this.isPreloading = false;
      console.log('✅ All photos already cached');
      return;
    }

    // Process in batches to avoid overwhelming the browser
    for (let i = 0; i < newUrls.length; i += batchSize) {
      const batch = newUrls.slice(i, i + batchSize);
      
      try {
        await Promise.allSettled(
          batch.map(url => this.preloadImage(url))
        );
        console.log(`✅ Preloaded batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(newUrls.length/batchSize)}`);
        
        // Small delay between batches to prevent browser freeze
        if (i + batchSize < newUrls.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.warn('⚠️ Error in batch preloading:', error);
      }
    }

    this.isPreloading = false;
    console.log(`🎉 Photo preloading completed! ${this.preloadedImages.size} images cached`);
  }

  // Check if an image is already preloaded
  isImagePreloaded(url: string): boolean {
    return this.preloadedImages.has(url);
  }

  // Get preloaded image if available
  getPreloadedImage(url: string): HTMLImageElement | null {
    return this.preloadedImages.get(url) || null;
  }

  // Clear cache (useful for memory management)
  clearCache(): void {
    this.preloadedImages.clear();
    console.log('🧹 Photo cache cleared');
  }

  // Get cache statistics
  getCacheStats(): { preloaded: number, queued: number } {
    return {
      preloaded: this.preloadedImages.size,
      queued: this.preloadQueue.size
    };
  }
}

// Export singleton instance
export const photoPreloader = new PhotoPreloaderService();

// ⚡ PATIENT DATA PRELOADER HOOK ⚡
import { useEffect } from 'react';
import { getPatientPhotoUrl } from './photoUtils';

export const usePatientPhotoPreloader = (patients: any[]) => {
  useEffect(() => {
    if (!patients || patients.length === 0) return;

    // Extract all photo URLs
    const photoUrls = patients
      .map(patient => patient.photo)
      .filter(photo => photo && photo.trim() !== '')
      .map(photo => getPatientPhotoUrl(photo))
      .filter(url => url !== '');

    if (photoUrls.length > 0) {
      // Preload photos in the background
      photoPreloader.preloadPhotos(photoUrls, 3); // Smaller batches for faster initial display
    }
  }, [patients]);
};
