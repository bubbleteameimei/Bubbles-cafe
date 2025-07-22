/**
 * Memoization utilities to optimize React component rendering
 */

import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  type ComponentType,
  type DependencyList,
  type FC,
  type EffectCallback
} from 'react';
import isEqual from 'lodash/isEqual';

/**
 * Enhanced memo HOC with deep comparison for props
 * Use this for components with complex props that memo alone doesn't handle well
 */
export function memoDeep<T extends ComponentType<any>>(Component: T) {
  return memo(
    Component,
    (prevProps, nextProps) => isEqual(prevProps, nextProps)
  );
}

/**
 * Hook to memoize a value with deep comparison
 * This is useful when React's built-in useMemo doesn't detect changes in complex objects
 */
export function useMemoDeep<T>(factory: () => T, deps: DependencyList): T {
  const ref = useRef<{ deps: DependencyList; value: T }>({
    deps,
    value: factory(),
  });

  if (!isEqual(deps, ref.current.deps)) {
    ref.current = {
      deps,
      value: factory(),
    };
  }

  return ref.current.value;
}

/**
 * Hook to create a stable callback function with deep comparison of dependencies
 * This is useful when useCallback doesn't detect changes in complex objects
 */
export function useCallbackDeep<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  // We use useMemoDeep to get deep equality checking
  return useMemoDeep(() => callback, deps);
}

/**
 * Creates a memoized selector function that only recalculates when its inputs change
 * Similar to reselect library without extra dependencies
 */
export function createSelector<Input, Output>(
  inputSelector: (state: any) => Input,
  resultFn: (input: Input) => Output
): (state: any) => Output {
  let lastInput: Input;
  let lastResult: Output;
  let hasRun = false;

  return (state: any) => {
    const input = inputSelector(state);
    
    if (!hasRun || !isEqual(input, lastInput)) {
      lastInput = input;
      lastResult = resultFn(input);
      hasRun = true;
    }
    
    return lastResult;
  };
}

/**
 * Hook that only triggers a re-render when the value changes based on deep comparison
 * This helps prevent unnecessary re-renders from parent components
 */
export function useStateWithDeepComparison<T>(initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initialValue);
  
  const setStateWithComparison = useCallback((newValue: T) => {
    setState(currentValue => 
      isEqual(currentValue, newValue) ? currentValue : newValue
    );
  }, []);
  
  return [state, setStateWithComparison];
}

/**
 * Effect hook with deep comparison for dependencies
 * This prevents effects from running when dependencies are similar but not identical
 */
export function useEffectDeep(effect: EffectCallback, deps: DependencyList) {
  const ref = useRef<DependencyList>(deps);
  
  if (!isEqual(deps, ref.current)) {
    ref.current = deps;
  }
  
  useEffect(effect, [ref.current]);
}

/**
 * Creates a stable ref to a function that always has the latest props and state
 * Useful for event handlers in class components or callbacks that don't need to trigger re-renders
 */
export function useEventCallback<T extends (...args: any[]) => any>(callback: T): T {
  const ref = useRef<T>(callback);
  
  // Update the stored callback when it changes
  useEffect(() => {
    ref.current = callback;
  }, [callback]);
  
  // Return a stable function that calls the latest callback
  return useCallback(
    ((...args) => ref.current(...args)) as T,
    []
  );
}