export interface Exercise {
  name: string;
  description: string;
  duration: string;
  intensity: 'Low' | 'Medium' | 'High';
  imageUrl: string;
}

export interface TrainingType {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  imageUrl: string;
}

export type ActiveMode = 'feedback' | 'training' | 'beforeStart';