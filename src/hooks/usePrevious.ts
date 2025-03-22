import { useState } from "react";

/**
 * A hook that returns the previous value of a variable
 * @param value The value to track
 * @returns The previous value of the variable
 * @example
 * const count = useState(0);
 * const previousCount = usePrevious(count);
 */
export function usePrevious<T>(value: T): T | undefined {
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
  }

  return prevValue;
}
