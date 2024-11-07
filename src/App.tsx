import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
  Grid,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Button,
} from '@mui/material';
import { Dumbbell, Bluetooth } from 'lucide-react';
import { trainingTypes } from './data/trainingData';
import { TrainingCard } from './components/TrainingCard';
import { ExerciseList } from './components/ExerciseList';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
    },
    secondary: {
      main: '#64748b',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
  },
});

function App() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const [connected, setConnected] = useState(true);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" color="transparent" enableColorOnDark sx={{ backdropFilter: 'blur(8px)' }}>
          <Toolbar sx={{ padding: '20px' }}>
            <Dumbbell size={32} style={{ marginRight: '12px', color: theme.palette.primary.main }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Изометрический тренинг
            </Typography>
            <Button
              color="primary"
              startIcon={<Bluetooth size={20} />}
              sx={{
                flexShrink: 0,
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.light',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                },
              }}
            >
              Подключить
            </Button>
          </Toolbar>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            indicatorColor="primary"
            sx={{ bgcolor: 'transparent' }}
          >
            <Tab disabled={!connected} label="Feedback mode" />
            <Tab disabled={!connected} label="Max mode" />
            <Tab disabled={!connected} label="Average mode" />
            <Tab disabled={!connected} label="Progress" />
          </Tabs>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 22, mb: 4, pointerEvents: connected ? 'auto' : 'none', opacity: connected ? 1 : 0.3 }}>
          {selectedTab === 0 && (
            <Box>
              <Typography variant="h4" sx={{ mb: 4, color: 'primary.light' }}>
                Training Programs
              </Typography>
              <Grid container spacing={3}>
                {trainingTypes.map((training) => (
                  <Grid item xs={12} sm={6} md={4} key={training.id}>
                    <TrainingCard training={training} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {selectedTab === 1 && (
            <Box>
              <Typography variant="h4" sx={{ mb: 4, color: 'primary.light' }}>
                Available Workouts
              </Typography>
              <Grid container spacing={4}>
                {trainingTypes.map((type) => (
                  <Grid item xs={12} key={type.id}>
                    <Typography variant="h5" sx={{ mb: 2, color: 'primary.light' }}>
                      {type.title}
                    </Typography>
                    <ExerciseList exercises={type.exercises} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {selectedTab === 2 && (
            <Box>
              <Typography variant="h4" sx={{ mb: 4, color: 'primary.light' }}>
                Exercise Library
              </Typography>
              <ExerciseList 
                exercises={trainingTypes.flatMap(type => type.exercises)} 
              />
            </Box>
          )}

          {selectedTab === 3 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h4" sx={{ mb: 2, color: 'primary.light' }}>
                Progress Tracking
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track your fitness journey and achievements here.
                (Coming soon...)
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;