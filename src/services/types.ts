export interface SetDataPoint {
  time: number;
  weight: number;
}

export const PROGRAMS = {
  IRON_MAN: "Iron Man",
  MILITARY_POWER: "Military Power",
  PROMETHEAN: "Promethean",
  PROMETHEAN_MARK_II: "Promethean Mark II",
} as const;

export type ProgramKey = keyof typeof PROGRAMS;
export type ProgramLabel = typeof PROGRAMS[ProgramKey];

export const EXERCISES = {
  // Iron Man exercises
  DEADLIFT: "ПОДЪЕМ ШТАНГИ С ПОЛА (DEADLIFT)",
  BICEPS_CURL: "ПОДЕМ НА БИЦЕПС (BICEPS CURL)", 
  SHOULDER_PRESS: "ПРЕСС ОТ ГРУДИ (SHOULDER PRESS)",
  FRONT_SQUAT: "ФРОНТАЛЬНЫЕ ВЫПАДЫ (FRONT SQUAT)",
  CALF_RAISE: "ПОДЪЕМЫ НА НОСКИ (CALF RAISE)",
  BENT_OVER_ROW: "ГАНТЕЛЬНАЯ ТЯГА В НАКЛОНЕ (BENT-OVER ROW)",
  
  // Military Power exercises
  MILITARY_DEADLIFT: "СТАНОВАЯ ТЯГА",
  MILITARY_SHOULDER_PRESS: "ЖИМ ПЛЕЧ"
} as const;

export type ExerciseKey = keyof typeof EXERCISES;
export type ExerciseLabel = typeof EXERCISES[ExerciseKey];

export type SetNumber = number;
export interface ExerciseData {
  [set: SetNumber]: SetDataPoint[];
}

export type DayData = Partial<Record<ExerciseKey, ExerciseData>>;

export interface ProgramData {
  [day: number]: DayData;
}

export type RequiredProgramData = {
  [day: number]: Required<DayData>;
};

export type TrainingData = Partial<Record<ProgramKey, ProgramData>>; 