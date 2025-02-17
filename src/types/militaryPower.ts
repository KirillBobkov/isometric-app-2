export enum ActiveMode {
  FEEDBACK = 'feedback',
  TRAINING = 'training',
  BEFORE_START = 'beforeStart'
}

export interface SetData {
  time: number;
  weight: number;
}

export interface SetDataPoint {
  time: number;
  weight: number;
}

export interface TrainingData {
  date: string;
  duration: number;
  sets: Record<number, SetDataPoint[]>;
  maxWeight: number;
  maxWeightPerSet: Record<number, number>;
}

export interface MilitaryPowerProps {
  connected: boolean;
  message: any;
} 