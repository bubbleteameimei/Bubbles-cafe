interface ApiLoaderProps {
  isLoading: boolean;
  loadingDelay?: number;
  minDisplayTime?: number;
}

/**
 * Empty component placeholder for API loading
 * All loading screen functionality has been removed
 */
export function ApiLoader({ 
  isLoading,
  loadingDelay = 300, 
  minDisplayTime = 500 
}: ApiLoaderProps) {
  return null; // This component doesn't render anything
}

export default ApiLoader;