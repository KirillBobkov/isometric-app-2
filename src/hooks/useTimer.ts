import { useState, useRef, useEffect, useCallback } from 'react';


const TIME_STEP = 700;
export const useTimer = (initialValue: number = 0, freeze: boolean = false) => {
  const [time, setTime] = useState(initialValue);
  const intervalRef = useRef<any>();

  useEffect(() => {
    if (freeze) {
      setTime(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTime(prev => prev + TIME_STEP);
    }, TIME_STEP);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [freeze]);

  const resetTime = useCallback(() => {
    setTime(0);
  }, []);

  return { time, resetTime };
}; 