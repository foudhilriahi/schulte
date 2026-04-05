/**
 * Production-Ready Storage Service
 * Handles localStorage with error handling, validation, and fallbacks
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'candidate_access_token',
  LEGACY_ACCESS_TOKEN: 'accessToken',
  USER_CVS: 'user_cvs',
  LEGACY_CV_DRAFT: 'latest_cv_draft',
} as const;

class StorageService {
  /**
   * Safely get item from localStorage
   */
  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      // Try to parse as JSON
      try {
        return JSON.parse(item) as T;
      } catch {
        // Return as string if not JSON
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Safely set item in localStorage
   */
  setItem(key: string, value: any): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      
      // Check if quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Clearing old data...');
        this.clearOldData();
        
        // Try again
        try {
          const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
          localStorage.setItem(key, stringValue);
          return true;
        } catch {
          return false;
        }
      }
      
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }

  /**
   * Clear all app data
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Clear old/unused data to free up space
   */
  private clearOldData(): void {
    // Remove legacy keys
    this.removeItem(STORAGE_KEYS.LEGACY_CV_DRAFT);
    
    // Could add more cleanup logic here
  }

  /**
   * Get storage size in bytes
   */
  getStorageSize(): number {
    if (typeof window === 'undefined') return 0;
    
    let total = 0;
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
    return total;
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new StorageService();
export { STORAGE_KEYS };
