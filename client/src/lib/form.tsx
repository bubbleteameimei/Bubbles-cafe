import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export function useZodForm<TSchema extends z.ZodTypeAny>(schema: TSchema, options?: Parameters<typeof useForm<z.infer<TSchema>>>[0]) {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    ...options,
  });
}

export function getErrorSummary(errors: Record<string, unknown>): string[] {
  try {
    return Object.entries(errors).map(([field, value]) => `${field}: ${(value as any)?.message || 'Invalid value'}`);
  } catch {
    return [];
  }
}

