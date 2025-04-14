export interface SetDataPoint {
  t: number;
  w: number;
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
  DEADLIFT: "СТАНОВАЯ ТЯГА",
  BICEPS_CURL: "ПОДЪЕМ НА БИЦЕПС", 
  FRONT_SQUAT: "ФРОНТАЛЬНЫЕ ПРИСЕДЫ",
  CALF_RAISE: "ПОДЪЕМЫ НА НОСКИ",
  BENT_OVER_ROW: "ГАНТЕЛЬНАЯ ТЯГА В НАКЛОНЕ",
  SHOULDER_PRESS: "ЖИМ ПЛЕЧАМИ СТОЯ"
} as const;

export type ExerciseKey = keyof typeof EXERCISES;
export type ExerciseLabel = typeof EXERCISES[ExerciseKey];

export type SetNumber = number;
export interface ExerciseData {
  maxWeight?: number;
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