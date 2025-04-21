/**
 * Re-export loading hook from GlobalLoadingProvider for consistent usage
 */
import { useLoading } from '../components/GlobalLoadingProvider';

// Re-export for backward compatibility
export { useLoading };
export default useLoading;