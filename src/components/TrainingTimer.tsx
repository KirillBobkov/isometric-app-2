import { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { formatTime } from '../utils/formatTime';
import { calculateProgress } from '../utils/circleProgress';
// Circle constants
import { CIRCLE_SIZE, CIRCLE_CENTER, CIRCLE_RADIUS, CIRCLE_CIRCUMFERENCE } from '../utils/circleProgress';

interface TrainingTimerProps {
  time: number;
  totalTime: number;
  color: string;
}

export const TrainingTimer: FC<TrainingTimerProps> = ({
  time,
  totalTime,
  color,
}) => {
  return (
    <div>
      <Box
        sx={{
          position: 'relative',
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto',
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
            stroke="#252525"
            strokeWidth="8"
          />
          {/* Прогресс */}
          <motion.circle
            cx={CIRCLE_CENTER}
            cy={CIRCLE_CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={calculateProgress(
              time,
              totalTime
            )}
            strokeLinecap="round"
            initial={false}
            animate={{
              strokeDashoffset: calculateProgress(
              time,
              totalTime
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
              color: "text.primary",
              fontWeight: "bold",
              fontSize: "3.5rem",
              textAlign: 'center',
            }}
          >
            {formatTime(time)}
          </Typography>
        </div>
      </Box>
    </div>
  );
}; 