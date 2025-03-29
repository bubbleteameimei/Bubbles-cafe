import { useLoading as useMinimalLoading } from '../components/minimal-loading';

/**
 * Minimal loading hook that replaces all previous loading hooks
 */
export function useLoading() {
  return useMinimalLoading();
}

export default useLoading;