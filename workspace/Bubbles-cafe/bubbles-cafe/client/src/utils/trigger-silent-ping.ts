import { useSilentPing } from '@/contexts/silent-ping-context';

/**
 * Utility function to manually trigger a silent ping
 * This is mainly for testing/demo purposes and can be called from any component
 * 
 * @example
 * // In a component
 * import { triggerSilentPing } from '@/utils/trigger-silent-ping';
 * 
 * function MyComponent() {
 *   const silentPingTrigger = useTriggerSilentPing();
 *   
 *   return (
 *     <button onClick={silentPingTrigger}>
 *       Trigger silent ping
 *     </button>
 *   );
 * }
 */
export function useTriggerSilentPing() {
  const { triggerSilentPing, isEnabled } = useSilentPing();
  
  return () => {
    if (isEnabled) {
      triggerSilentPing();
      console.log('[SilentPing] Manually triggered');
    } else {
      console.log('[SilentPing] Feature is disabled');
    }
  };
}

/**
 * Utility hook to toggle silent ping feature on/off
 */
export function useSilentPingToggle() {
  const { isEnabled, toggleEnabled } = useSilentPing();
  
  return {
    isEnabled,
    toggleEnabled
  };
}