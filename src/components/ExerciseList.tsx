import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar,
  Typography,
  Chip,
  Box
} from '@mui/material';
import { Exercise } from '../types/training';

interface ExerciseListProps {
  exercises: Exercise[];
}

export const ExerciseList: React.FC<ExerciseListProps> = ({ exercises }) => {
  return (
    <List>
      {exercises.map((exercise, index) => (
        <ListItem 
          key={index}
          alignItems="flex-start"
          sx={{ 
            mb: 2, 
            background: 'linear-gradient(to right, rgba(30, 41, 59, 0.8), rgba(30, 41, 59, 0.95))',
            backdropFilter: 'blur(8px)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'rgba(59, 130, 246, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              transform: 'translateX(4px)',
            },
          }}
        >
          <ListItemAvatar>
            <Avatar 
              src={exercise.imageUrl}
              alt={exercise.name}
              sx={{ 
                width: 56, 
                height: 56, 
                mr: 2,
                border: '2px solid',
                borderColor: 'primary.main',
              }}
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="h6" component="div" color="primary.light">
                {exercise.name}
              </Typography>
            }
            secondary={
              <Box>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  {exercise.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={exercise.duration}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      '& .MuiChip-label': {
                        color: 'primary.light',
                      },
                    }}
                  />
                  <Chip 
                    label={exercise.intensity}
                    size="small"
                    sx={{
                      backgroundColor: 
                        exercise.intensity === 'High' ? 'rgba(239, 68, 68, 0.2)' :
                        exercise.intensity === 'Medium' ? 'rgba(245, 158, 11, 0.2)' :
                        'rgba(34, 197, 94, 0.2)',
                      '& .MuiChip-label': {
                        color:
                          exercise.intensity === 'High' ? '#ef4444' :
                          exercise.intensity === 'Medium' ? '#f59e0b' :
                          '#22c55e',
                      },
                    }}
                  />
                </Box>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};