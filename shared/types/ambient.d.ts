/**
 * Ambient module declarations for packages without TypeScript types.
 * These are used only for type-checking and do not affect runtime.
 */

declare module '@replit/vite-plugin-runtime-error-modal' {
  const plugin: (...args: any[]) => any;
  export default plugin;
}

declare module '@replit/vite-plugin-shadcn-theme-json' {
  const plugin: (...args: any[]) => any;
  export default plugin;
}