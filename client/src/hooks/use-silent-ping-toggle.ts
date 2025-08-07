// Simple client-side toggle for the “silent ping” feature.
// This is a placeholder to unblock TypeScript compilation until the full
// implementation is available.
import { useCallback, useState } from 'react'

interface UseSilentPingToggleReturn {
  isEnabled: boolean
  toggleEnabled: () => void
}

export function useSilentPingToggle(initial = false): UseSilentPingToggleReturn {
  const [isEnabled, setEnabled] = useState<boolean>(initial)

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => !prev)
  }, [])

  return { isEnabled, toggleEnabled }
}