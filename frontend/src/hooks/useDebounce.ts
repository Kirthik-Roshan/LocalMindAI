"use client";

import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of the provided value that only updates after
 * `delay` milliseconds have elapsed without a change.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
