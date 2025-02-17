import { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { formatTime } from '../utils/formatTime';
import { CIRCLE_SIZE, CIRCLE_CENTER, CIRCLE_RADIUS, CIRCLE_CIRCUMFERENCE } from '../constants/militaryPower';
import { calculateProgress } from '../utils/circleProgress';
import { ActiveMode } from '../types/training';

interface TrainingTimerProps {
  mode: ActiveMode;
  isResting: boolean;
  restTime: number;
  setTime: number;
  currentSet: number;
  REST_TIME: number;
  SET_TIME: number;
}

export const TrainingTimer: FC<TrainingTimerProps> = ({
  mode,
  isResting,
  restTime,
  setTime,
  currentSet,
  REST_TIME,
  SET_TIME
}) => {
  return (
    <div>
      {/* Показываем разный текст в зависимости от режима */}
      <div>
        {mode === 'training' && 'Тренировка'}
        {mode === 'feedback' && 'Режим обратной связи'}
      </div>
      <Box
        sx={{
          position: 'relative',
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <svg
          width={CIRCLE_SIZE}
          height={CIRCLE_SIZE}
          viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
          style={{
            position: 'absolute',
            transform: 'rotate(-90deg)', // Поворачиваем, чтобы начало было сверху
          }}
        >
          {/* Фоновый круг */}
          <circle
            cx={CIRCLE_CENTER}
            cy={CIRCLE_CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="text.secondary"
            strokeWidth="8"
          />
          {/* Прогресс */}
          <motion.circle
            cx={CIRCLE_CENTER}
            cy={CIRCLE_CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={isResting ? "#9e9e9e" : "#1976d2"}
            strokeWidth="8"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={calculateProgress(
              isResting ? restTime : setTime,
              isResting ? REST_TIME : SET_TIME
            )}
            strokeLinecap="round"
            initial={false}
            animate={{
              strokeDashoffset: calculateProgress(
                isResting ? restTime : setTime,
                isResting ? REST_TIME : SET_TIME
              )
            }}
            transition={{ duration: 0.1 }}
          />
        </svg>
        
        {/* Текст таймера в центре */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              color: isResting ? "text.secondary" : "text.primary",
              fontWeight: "bold",
              fontSize: "3.5rem",
              textAlign: 'center',
            }}
          >
            {isResting ? formatTime(restTime) : formatTime(setTime)}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: isResting ? "text.secondary" : "text.primary",
              textAlign: 'center',
            }}
          >
            {isResting ? "Отдых" : `Подход ${currentSet}`}
          </Typography>
        </div>
      </Box>
    </div>
  );
}; 