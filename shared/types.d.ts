declare module 'drizzle-zod' {
  export function createInsertSchema(table: any, fieldsConfig?: Record<string, any>, options?: Record<string, any>): any;
}