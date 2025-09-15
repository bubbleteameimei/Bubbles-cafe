import { Dispatch, SetStateAction } from 'react';

/**
 * Helper type to allow Dispatch<SetStateAction<T>> to work with components 
 * that expect (value: string) => void callbacks
 */
export function createTypedSetState<T extends string>(
  setState: Dispatch<SetStateAction<T>>
): (value: string) => void {
  return (value: string) => setState(value as T);
}