import { useState, useEffect, useCallback } from 'react';

export type WordPressApiStatus = 'available' | 'unavailable' | 'checking';
export type WordPressErrorType = 'timeout' | 'cors' | 'parse' | 'authentication' | 'rate_limit' | 'unknown';

interface WordPressStatusCache {
  status: WordPressApiStatus;
  timestamp: number;
  error?: WordPressErrorType;
}

const CACHE_KEY = 'wordpressApiStatus';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const API_BASE_URL = import.meta.env.VITE_WORDPRESS_API_URL || 'https://bubbleteameimei.wordpress.com/wp-json';

export function useWordPressApiStatus() {
  const [status, setStatus] = useState<WordPressApiStatus>('checking');
  const [errorType, setErrorType] = useState<WordPressErrorType | undefined>(undefined);
  const [lastChecked, setLastChecked] = useState<number>(0);

  const categorizeError = (error: any): WordPressErrorType => {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorDetails = error?.toString().toLowerCase() || '';
    
    if (errorMessage.includes('timeout') || errorDetails.includes('timeout')) {
      return 'timeout';
    }
    
    if (errorMessage.includes('cors') || errorDetails.includes('cors') || 
        errorMessage.includes('origin') || errorDetails.includes('access-control')) {
      return 'cors';
    }
    
    if (errorMessage.includes('json') || errorDetails.includes('json') || 
        errorMessage.includes('parse') || errorDetails.includes('syntax')) {
      return 'parse';
    }
    
    if (errorMessage.includes('authentication') || errorDetails.includes('auth') ||
        errorMessage.includes('401') || errorDetails.includes('unauthorized')) {
      return 'authentication';
    }
    
    if (errorMessage.includes('rate') || errorDetails.includes('limit') ||
        errorMessage.includes('429') || errorDetails.includes('too many requests')) {
      return 'rate_limit';
    }
    
    return 'unknown';
  };

  const loadFromCache = useCallback((): boolean => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsedCache: WordPressStatusCache = JSON.parse(cached);
        if (Date.now() - parsedCache.timestamp < CACHE_TTL) {
          setStatus(parsedCache.status);
          setErrorType(parsedCache.error);
          setLastChecked(parsedCache.timestamp);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading WordPress API status from cache:', error);
      return false;
    }
  }, []);

  const saveToCache = useCallback((status: WordPressApiStatus, error?: WordPressErrorType) => {
    try {
      const timestamp = Date.now();
      const cacheData: WordPressStatusCache = {
        status,
        timestamp,
        error
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      setLastChecked(timestamp);
    } catch (error) {
      console.error('Error saving WordPress API status to cache:', error);
    }
  }, []);

  const checkApiStatus = useCallback(async (): Promise<boolean> => {
    setStatus('checking');
    
    try {
      // Try multiple endpoints for reliability
      const endpoints = [
        '/wp/v2/posts?per_page=1',
        '/wp/v2/pages?per_page=1',
        '/wp/v2/categories?per_page=1'
      ];
      
      for (const endpoint of endpoints) {
        try {
          // Add timestamp to prevent caching
          const url = `${API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}_=${Date.now()}`;
          
          // Use a timeout to ensure the request doesn't hang
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            setStatus('available');
            setErrorType(undefined);
            saveToCache('available');
            return true;
          }
        } catch (endpointError) {
          // Continue to the next endpoint if this one fails
          console.warn(`Endpoint ${endpoint} check failed:`, endpointError);
        }
      }
      
      // If we get here, all endpoints failed
      const error: WordPressErrorType = 'unknown';
      setStatus('unavailable');
      setErrorType(error);
      saveToCache('unavailable', error);
      return false;
    } catch (error) {
      const errorCategory = categorizeError(error);
      setStatus('unavailable');
      setErrorType(errorCategory);
      saveToCache('unavailable', errorCategory);
      console.error('WordPress API status check failed:', error);
      return false;
    }
  }, [saveToCache]);

  useEffect(() => {
    const cachedDataExists = loadFromCache();
    
    // If no valid cached data, check the API status immediately
    if (!cachedDataExists) {
      checkApiStatus();
    }
    
    // Set up periodic checks
    const intervalId = setInterval(() => {
      // Only do periodic checks if the API is unavailable
      if (status === 'unavailable') {
        checkApiStatus();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [checkApiStatus, loadFromCache, status]);

  return {
    status,
    errorType,
    lastChecked,
    checkApiStatus
  };
}