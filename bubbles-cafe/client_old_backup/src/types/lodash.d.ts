/**
 * Custom type declarations for lodash
 * 
 * This allows us to import specific lodash functions without importing the whole library,
 * while still maintaining good type safety.
 */

declare module 'lodash/isEqual' {
  function isEqual<T>(value: T, other: any): boolean;
  export default isEqual;
}

declare module 'lodash/memoize' {
  function memoize<T extends (...args: any[]) => any>(
    func: T,
    resolver?: (...args: Parameters<T>) => any
  ): T & { cache: Map<any, any> };
  export default memoize;
}

declare module 'lodash/throttle' {
  interface ThrottleSettings {
    leading?: boolean;
    trailing?: boolean;
  }
  
  function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options?: ThrottleSettings
  ): T & { cancel: () => void; flush: () => void };
  
  export default throttle;
}

declare module 'lodash/debounce' {
  interface DebounceSettings {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  }
  
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options?: DebounceSettings
  ): T & { cancel: () => void; flush: () => void };
  
  export default debounce;
}

declare module 'lodash/cloneDeep' {
  function cloneDeep<T>(value: T): T;
  export default cloneDeep;
}

declare module 'lodash/merge' {
  function merge<TObject, TSource>(
    object: TObject,
    source: TSource
  ): TObject & TSource;
  
  function merge<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2
  ): TObject & TSource1 & TSource2;
  
  function merge<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): TObject & TSource1 & TSource2 & TSource3;
  
  function merge<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): TObject & TSource1 & TSource2 & TSource3 & TSource4;
  
  export default merge;
}

declare module 'lodash/uniqBy' {
  function uniqBy<T>(array: T[], iteratee: keyof T | ((value: T) => any)): T[];
  export default uniqBy;
}

declare module 'lodash/groupBy' {
  function groupBy<T>(
    collection: T[],
    iteratee: keyof T | ((value: T) => string)
  ): Record<string, T[]>;
  export default groupBy;
}