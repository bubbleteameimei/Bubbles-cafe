export const FLAGS = {
  ENABLE_SSR: (import.meta as any).env?.ENABLE_SSR === 'true' || false,
  ENABLE_TRACING: (import.meta as any).env?.ENABLE_TRACING === 'true' || false,
  ENABLE_A11Y_DEV: (import.meta as any).env?.ENABLE_A11Y_DEV !== 'false',
} as const;

