export const CIRCLE_SIZE = 200;
export const CIRCLE_CENTER = CIRCLE_SIZE / 2;
export const CIRCLE_RADIUS = 90;
export const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; 

export const calculateProgress = (currentTime: number, totalTime: number) => {
  const safeCurrentTime = Math.max(0, Math.min(currentTime, totalTime));
  const progress = 1 - (safeCurrentTime / totalTime);
  return CIRCLE_CIRCUMFERENCE * progress;
}; 