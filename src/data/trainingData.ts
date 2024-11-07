import { TrainingType } from '../types/training';

export const trainingTypes: TrainingType[] = [
  {
    id: 'strength',
    title: 'Strength Training',
    description: 'Build muscle and increase strength through progressive resistance training',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000',
    exercises: [
      {
        name: 'Deadlifts',
        description: 'Compound exercise targeting multiple muscle groups',
        duration: '15 minutes',
        intensity: 'High',
        imageUrl: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&q=80&w=1000'
      },
      // More exercises...
    ]
  },
  {
    id: 'cardio',
    title: 'Cardio Training',
    description: 'Improve cardiovascular health and endurance',
    imageUrl: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=1000',
    exercises: [
      {
        name: 'HIIT Running',
        description: 'High-intensity interval training on the treadmill',
        duration: '20 minutes',
        intensity: 'High',
        imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1000'
      },
      // More exercises...
    ]
  },
  {
    id: 'flexibility',
    title: 'Flexibility Training',
    description: 'Enhance mobility and reduce injury risk',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000',
    exercises: [
      {
        name: 'Dynamic Stretching',
        description: 'Full-body mobility routine',
        duration: '15 minutes',
        intensity: 'Low',
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=1000'
      },
      // More exercises...
    ]
  },
  {
    id: 'hiit',
    title: 'HIIT Training',
    description: 'Maximum results in minimum time with high-intensity intervals',
    imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&q=80&w=1000',
    exercises: [
      {
        name: 'Tabata Protocol',
        description: '20 seconds work, 10 seconds rest',
        duration: '4 minutes',
        intensity: 'High',
        imageUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&q=80&w=1000'
      },
      // More exercises...
    ]
  },
  {
    id: 'functional',
    title: 'Functional Training',
    description: 'Improve everyday movement patterns and core strength',
    imageUrl: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&q=80&w=1000',
    exercises: [
      {
        name: 'Kettlebell Complex',
        description: 'Full-body functional movement series',
        duration: '25 minutes',
        intensity: 'Medium',
        imageUrl: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&q=80&w=1000'
      },
      // More exercises...
    ]
  }
];