import { CIRCLE_CIRCUMFERENCE } from '../constants/militaryPower';

export const calculateProgress = (currentTime: number, totalTime: number) => {
  const safeCurrentTime = Math.max(0, Math.min(currentTime, totalTime));
  const progress = 1 - (safeCurrentTime / totalTime);
  return CIRCLE_CIRCUMFERENCE * progress;
}; 