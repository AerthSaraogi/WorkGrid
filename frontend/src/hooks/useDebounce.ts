import { useEffect, useState } from 'react';

/**
 * Custom hook to debounce any fast-changing value (e.g. search input).
 * Demonstrates: closures, setTimeout, useEffect cleanup, and event loop mechanics.
 * 
 * @param value The value to debounce
 * @param delay Milliseconds to wait after last change (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Schedule a timer to update debouncedValue after 'delay' milliseconds
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: runs if 'value' or 'delay' changes before the timer executes,
    // thereby canceling the pending execution (clearing the previous timer).
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
