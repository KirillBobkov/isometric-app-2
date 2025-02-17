import { useState, useRef, useEffect, useCallback } from 'react';


const TIME_STEP = 500;
export const useTimer = (initialValue: number = 0) => {
  const [time, setTime] = useState(initialValue);
  const intervalRef = useRef<any>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTime(prev => prev + TIME_STEP);
    }, TIME_STEP);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    setTime(0);
  }, []);

  return { time, reset };
}; 