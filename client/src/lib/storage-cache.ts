
interface CacheOptions {
  expiry?: number; // Time in milliseconds
}

interface CacheItem<T> {
  value: T;
  timestamp: number;
  expiry?: number;
}

const DEFAULT_CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours

export class StorageCache {
  private storage: Storage;
  private prefix: string;

  constructor(useSessionStorage = false, prefix = 'horror-blog-') {
    this.storage = useSessionStorage ? sessionStorage : localStorage;
    this.prefix = prefix;
  }

  /**
   * Get an item from the cache
   */
  public get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(this.prefix + key);
      if (!item) return null;

      const parsedItem: CacheItem<T> = JSON.parse(item);
      
      // Check if item has expired
      if (parsedItem.expiry && Date.now() > parsedItem.timestamp + parsedItem.expiry) {
        this.remove(key);
        return null;
      }

      return parsedItem.value;
    } catch (error) {
      console.error(`[StorageCache] Error retrieving ${key}:`, error);
      return null;
    }
  }

  /**
   * Set an item in the cache
   */
  public set<T>(key: string, value: T, options: CacheOptions = {}): boolean {
    try {
      const cacheItem: CacheItem<T> = {
        value,
        timestamp: Date.now(),
        expiry: options.expiry || DEFAULT_CACHE_TIME
      };

      this.storage.setItem(this.prefix + key, JSON.stringify(cacheItem));
      return true;
    } catch (error) {
      console.error(`[StorageCache] Error setting ${key}:`, error);
      
      // If the error is a quota error, clear older items
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldest(5);
        
        // Try again after clearing space
        try {
          const cacheItem: CacheItem<T> = {
            value,
            timestamp: Date.now(),
            expiry: options.expiry || DEFAULT_CACHE_TIME
          };
          this.storage.setItem(this.prefix + key, JSON.stringify(cacheItem));
          return true;
        } catch (retryError) {
          console.error(`[StorageCache] Retry failed for ${key}:`, retryError);
        }
      }
      
      return false;
    }
  }

  /**
   * Remove an item from the cache
   */
  public remove(key: string): boolean {
    try {
      this.storage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error(`[StorageCache] Error removing ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all items with this prefix from the cache
   */
  public clearAll(): boolean {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => this.storage.removeItem(key));
      return true;
    } catch (error) {
      console.error('[StorageCache] Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Clear oldest items from the cache
   */
  private clearOldest(count: number): boolean {
    try {
      // Get all items with our prefix
      const items: Array<{key: string; timestamp: number}> = [];
      
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const rawValue = this.storage.getItem(key);
          if (rawValue) {
            try {
              const item: CacheItem<unknown> = JSON.parse(rawValue);
              items.push({ key, timestamp: item.timestamp });
            } catch (e) {
              // If we can't parse it, consider it old and add it
              items.push({ key, timestamp: 0 });
            }
          }
        }
      }
      
      // Sort by age (oldest first) and remove the requested number
      items.sort((a, b) => a.timestamp - b.timestamp);
      const itemsToRemove = items.slice(0, count);
      
      itemsToRemove.forEach(item => this.storage.removeItem(item.key));
      return true;
    } catch (error) {
      console.error('[StorageCache] Error clearing oldest items:', error);
      return false;
    }
  }
}

// Export singleton instances
export const localCache = new StorageCache(false);
export const sessionCache = new StorageCache(true);
