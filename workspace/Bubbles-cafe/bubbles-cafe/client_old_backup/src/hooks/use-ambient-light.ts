import { useState, useEffect } from 'react';
import useUserPreferences from './useUserPreferences';

/**
 * Ambient Light Detection Hook
 * 
 * This hook detects ambient light levels and provides functionality to adjust content contrast
 * for better visibility in bright environments.
 * 
 * Features:
 * - Uses the Ambient Light Sensor API if available
 * - Falls back to time-based estimation when sensor is not available
 * - Provides user preference to enable/disable auto-contrast
 * - Calculates appropriate contrast enhancement based on light levels
 */
const useAmbientLight = () => {
  // State for light level detection
  const [lightLevel, setLightLevel] = useState<number | null>(null);
  
  // User preference for auto-contrast feature
  const [autoContrastEnabled, setAutoContrastEnabled] = useUserPreferences<boolean>('reader_auto_contrast_enabled', true);
  
  // Calculated contrast adjustment (0-100 percentage)
  const [contrastAdjustment, setContrastAdjustment] = useState(0);

  // Attempt to use AmbientLightSensor API
  useEffect(() => {
    // Skip if auto-contrast is disabled by user
    if (!autoContrastEnabled) {
      setContrastAdjustment(0);
      return;
    }

    let sensor: any = null;

    const initSensor = async () => {
      try {
        // Check if the Ambient Light Sensor API is available
        if ('AmbientLightSensor' in window) {
          // Request permission if needed
          if (navigator.permissions) {
            const result = await navigator.permissions.query({ name: 'ambient-light-sensor' as any });
            if (result.state === 'denied') {
              console.log('[AmbientLight] Permission to use light sensor denied');
              useFallbackMethod();
              return;
            }
          }

          // @ts-ignore - AmbientLightSensor is not in the standard TypeScript types
          sensor = new (window as any).AmbientLightSensor({ frequency: 1 });
          sensor.addEventListener('reading', () => {
            if (sensor.illuminance !== null && sensor.illuminance !== undefined) {
              setLightLevel(sensor.illuminance);
              
              // Calculate contrast adjustment (more illuminance = more contrast)
              // Typical indoor lighting is 100-500 lux, bright sunlight is 10,000+ lux
              let adjustment = 0;
              if (sensor.illuminance > 250) {
                // Start increasing contrast at 250 lux (moderately bright indoor)
                // Max out at 5000 lux (bright daylight)
                adjustment = Math.min(Math.floor((sensor.illuminance - 250) / 50), 100);
                setContrastAdjustment(adjustment);
              } else {
                setContrastAdjustment(0);
              }
            }
          });
          
          sensor.addEventListener('error', (error: Error) => {
            console.error('[AmbientLight] Sensor error:', error);
            useFallbackMethod();
          });
          
          sensor.start();
        } else {
          console.log('[AmbientLight] Ambient Light Sensor API not available');
          useFallbackMethod();
        }
      } catch (error) {
        console.error('[AmbientLight] Error initializing sensor:', error);
        useFallbackMethod();
      }
    };

    // Fallback method using time of day as a rough estimation
    const useFallbackMethod = () => {
      const estimateLightLevelByTime = () => {
        const hour = new Date().getHours();
        
        // Very simple approximation based on time of day
        // Brightest mid-day (10am-2pm), darker in morning/evening
        let estimatedLux = 0;
        
        if (hour >= 10 && hour <= 14) {
          // Mid-day: high brightness
          estimatedLux = 500; // Approximate indoor mid-day light level
        } else if ((hour >= 7 && hour < 10) || (hour > 14 && hour <= 18)) {
          // Morning/Afternoon: medium brightness
          estimatedLux = 300;
        } else {
          // Evening/Night: low brightness
          estimatedLux = 100;
        }
        
        setLightLevel(estimatedLux);
        
        // Calculate contrast adjustment
        if (estimatedLux > 250) {
          const adjustment = Math.min(Math.floor((estimatedLux - 250) / 50), 100);
          setContrastAdjustment(adjustment);
        } else {
          setContrastAdjustment(0);
        }
      };
      
      // Initial estimate
      estimateLightLevelByTime();
      
      // Update estimate every 15 minutes
      const interval = setInterval(estimateLightLevelByTime, 15 * 60 * 1000);
      
      return () => clearInterval(interval);
    };

    // Initialize sensor or fallback
    initSensor();

    // Cleanup
    return () => {
      if (sensor) {
        sensor.stop();
      }
    };
  }, [autoContrastEnabled]);

  return {
    lightLevel,
    contrastAdjustment,
    autoContrastEnabled,
    setAutoContrastEnabled
  };
};

export default useAmbientLight;