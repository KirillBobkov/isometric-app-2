import React from 'react';
import { Card, CardContent, CardMedia, Typography, Chip, Box } from '@mui/material';
import { TrainingType } from '../types/training';

interface TrainingCardProps {
  training: TrainingType;
}

export const TrainingCard: React.FC<TrainingCardProps> = ({ training }) => {
  return (
    <Card 
      sx={{ 
        maxWidth: 345, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.8), rgba(30, 41, 59, 0.95))',
        backdropFilter: 'blur(8px)',
        border: '1px solid',
        borderColor: 'rgba(59, 130, 246, 0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'primary.main',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)',
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={training.imageUrl}
        alt={training.title}
        sx={{ 
          objectFit: 'cover',
          filter: 'brightness(0.8)',
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div" color="primary.light">
          {training.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {training.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`${training.exercises.length} exercises`} 
            color="primary" 
            size="small"
            sx={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              '& .MuiChip-label': {
                color: 'primary.light',
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};