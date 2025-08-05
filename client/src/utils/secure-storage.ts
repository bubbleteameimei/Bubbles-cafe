/**
 * Secure Storage Utility
 * Provides reliable client-side storage with server-side synchronization
 * Handles localStorage/sessionStorage failures gracefully
 */

interface StorageOptions {
  encrypt?: boolean;
  syncWithServer?: boolean;
  fallbackToMemory?: boolean;
  expirationTime?: number; // in milliseconds
}

interface StoredItem {
  value: any;
  timestamp: number;
  expiresAt?: number;
  encrypted?: boolean;
}

class SecureStorageManager {
  private memoryStorage: Map<string, StoredItem> = new Map();
  private isLocalStorageAvailable: boolean = false;
  private isSessionStorageAvailable: boolean = false;

  constructor() {
    this.checkStorageAvailability();
  }

  /**
   * Check if localStorage and sessionStorage are available
   */
  private checkStorageAvailability(): void {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.isLocalStorageAvailable = true;
    } catch (error) {
      console.warn('[SecureStorage] localStorage not available:', error);
      this.isLocalStorageAvailable = false;
    }

    try {
      const testKey = '__session_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      this.isSessionStorageAvailable = true;
    } catch (error) {
      console.warn('[SecureStorage] sessionStorage not available:', error);
      this.isSessionStorageAvailable = false;
    }
  }

  /**
   * Simple encryption for sensitive data
   */
  private encrypt(data: string): string {
    // Simple XOR encryption (for basic obfuscation)
    const key = 'bubbles-cafe-storage-key';
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  }

  /**
   * Simple decryption for sensitive data
   */
  private decrypt(encryptedData: string): string {
    try {
      const key = 'bubbles-cafe-storage-key';
      const data = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return decrypted;
    } catch (error) {
      
      return '';
    }
  }

  /**
   * Store data securely with options
   */
  setItem(
    key: string,
    value: any,
    storageType: 'local' | 'session' | 'memory' = 'local',
    options: StorageOptions = {}
  ): boolean {
    const {
      encrypt = false,
      expirationTime,
      fallbackToMemory = true
    } = options;

    const item: StoredItem = {
      value,
      timestamp: Date.now(),
      encrypted: encrypt
    };

    if (expirationTime) {
      item.expiresAt = Date.now() + expirationTime;
    }

    let serializedValue: string;
    try {
      serializedValue = JSON.stringify(item);
      if (encrypt) {
        serializedValue = this.encrypt(serializedValue);
      }
    } catch (error) {
      
      return false;
    }

    // Try to store in requested storage type
    try {
      if (storageType === 'local' && this.isLocalStorageAvailable) {
        localStorage.setItem(key, serializedValue);
        return true;
      } else if (storageType === 'session' && this.isSessionStorageAvailable) {
        sessionStorage.setItem(key, serializedValue);
        return true;
      } else if (storageType === 'memory') {
        this.memoryStorage.set(key, item);
        return true;
      }
    } catch (error) {
      console.warn(`[SecureStorage] Failed to store in ${storageType}Storage:`, error);
    }

    // Fallback to memory storage
    if (fallbackToMemory) {
      this.memoryStorage.set(key, item);
      console.info(`[SecureStorage] Stored '${key}' in memory as fallback`);
      return true;
    }

    return false;
  }

  /**
   * Retrieve data securely
   */
  getItem(
    key: string,
    storageType: 'local' | 'session' | 'memory' = 'local'
  ): any {
    let serializedValue: string | null = null;
    let item: StoredItem | null = null;

    // Try to retrieve from requested storage type
    try {
      if (storageType === 'local' && this.isLocalStorageAvailable) {
        serializedValue = localStorage.getItem(key);
      } else if (storageType === 'session' && this.isSessionStorageAvailable) {
        serializedValue = sessionStorage.getItem(key);
      } else if (storageType === 'memory') {
        item = this.memoryStorage.get(key) || null;
      }
    } catch (error) {
      console.warn(`[SecureStorage] Failed to retrieve from ${storageType}Storage:`, error);
    }

    // If we got a serialized value, parse it
    if (serializedValue) {
      try {
        let parsedValue = serializedValue;
        
        // Check if it looks encrypted (base64)
        if (serializedValue.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
          try {
            parsedValue = this.decrypt(serializedValue);
          } catch (decryptError) {
            // Not encrypted or decryption failed, use as is
          }
        }

        item = JSON.parse(parsedValue);
      } catch (error) {
        
        return null;
      }
    }

    // Check if item exists and is not expired
    if (item) {
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.removeItem(key, storageType);
        return null;
      }
      return item.value;
    }

    // Try fallback storages
    if (storageType !== 'memory') {
      const memoryValue = this.getItem(key, 'memory');
      if (memoryValue !== null) {
        return memoryValue;
      }
    }

    if (storageType === 'local' && this.isSessionStorageAvailable) {
      return this.getItem(key, 'session');
    } else if (storageType === 'session' && this.isLocalStorageAvailable) {
      return this.getItem(key, 'local');
    }

    return null;
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string, storageType: 'local' | 'session' | 'memory' = 'local'): void {
    try {
      if (storageType === 'local' && this.isLocalStorageAvailable) {
        localStorage.removeItem(key);
      } else if (storageType === 'session' && this.isSessionStorageAvailable) {
        sessionStorage.removeItem(key);
      } else if (storageType === 'memory') {
        this.memoryStorage.delete(key);
      }
    } catch (error) {
      console.warn(`[SecureStorage] Failed to remove from ${storageType}Storage:`, error);
    }

    // Also remove from memory fallback
    this.memoryStorage.delete(key);
  }

  /**
   * Clear all storage
   */
  clear(storageType: 'local' | 'session' | 'memory' = 'local'): void {
    try {
      if (storageType === 'local' && this.isLocalStorageAvailable) {
        localStorage.clear();
      } else if (storageType === 'session' && this.isSessionStorageAvailable) {
        sessionStorage.clear();
      } else if (storageType === 'memory') {
        this.memoryStorage.clear();
      }
    } catch (error) {
      console.warn(`[SecureStorage] Failed to clear ${storageType}Storage:`, error);
    }
  }

  /**
   * Get storage info and health status
   */
  getStorageInfo(): {
    localStorage: { available: boolean; usage?: number };
    sessionStorage: { available: boolean; usage?: number };
    memoryStorage: { available: boolean; usage: number };
  } {
    const info = {
      localStorage: { available: this.isLocalStorageAvailable },
      sessionStorage: { available: this.isSessionStorageAvailable },
      memoryStorage: { available: true, usage: this.memoryStorage.size }
    };

    // Try to get storage usage
    if (this.isLocalStorageAvailable) {
      try {
        let localStorageSize = 0;
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            localStorageSize += localStorage[key].length;
          }
        }
        info.localStorage.usage = localStorageSize;
      } catch (error) {
        // Ignore errors getting usage
      }
    }

    if (this.isSessionStorageAvailable) {
      try {
        let sessionStorageSize = 0;
        for (const key in sessionStorage) {
          if (sessionStorage.hasOwnProperty(key)) {
            sessionStorageSize += sessionStorage[key].length;
          }
        }
        info.sessionStorage.usage = sessionStorageSize;
      } catch (error) {
        // Ignore errors getting usage
      }
    }

    return info;
  }

  /**
   * Sync with server-side session storage
   */
  async syncWithServer(keys?: string[]): Promise<boolean> {
    try {
      const response = await fetch('/api/session/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ keys })
      });

      if (response.ok) {
        const serverData = await response.json();
        
        // Update local storage with server data
        if (serverData.data) {
          Object.entries(serverData.data).forEach(([key, value]) => {
            this.setItem(key, value, 'local', { syncWithServer: false });
          });
        }

        return true;
      }
    } catch (error) {
      
    }

    return false;
  }

  /**
   * Clean up expired items
   */
  cleanup(): void {
    const now = Date.now();

    // Clean memory storage
    for (const [key, item] of this.memoryStorage.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.memoryStorage.delete(key);
      }
    }

    // Clean localStorage
    if (this.isLocalStorageAvailable) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const item = this.getItem(key, 'local');
            if (item === null) {
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.warn('[SecureStorage] localStorage cleanup failed:', error);
      }
    }

    // Clean sessionStorage
    if (this.isSessionStorageAvailable) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            const item = this.getItem(key, 'session');
            if (item === null) {
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
      } catch (error) {
        console.warn('[SecureStorage] sessionStorage cleanup failed:', error);
      }
    }
  }
}

// Create singleton instance
export const secureStorage = new SecureStorageManager();

// Auto-cleanup every 5 minutes
setInterval(() => {
  secureStorage.cleanup();
}, 5 * 60 * 1000);

// Export convenience functions
export const setSecureItem = (
  key: string,
  value: any,
  storageType: 'local' | 'session' | 'memory' = 'local',
  options?: StorageOptions
) => secureStorage.setItem(key, value, storageType, options);

export const getSecureItem = (
  key: string,
  storageType: 'local' | 'session' | 'memory' = 'local'
) => secureStorage.getItem(key, storageType);

export const removeSecureItem = (
  key: string,
  storageType: 'local' | 'session' | 'memory' = 'local'
) => secureStorage.removeItem(key, storageType);

export const clearSecureStorage = (
  storageType: 'local' | 'session' | 'memory' = 'local'
) => secureStorage.clear(storageType);

export const getStorageHealth = () => secureStorage.getStorageInfo();

export const syncWithServer = (keys?: string[]) => secureStorage.syncWithServer(keys);