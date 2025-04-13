import { StorageService } from './StorageService';

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

export type TrainingData = Record<ProgramKey, ProgramData>;

export const saveTrainingData = async (programKey: ProgramKey, programData: ProgramData) => {
  try {
    // Сначала сохраняем в localStorage
    StorageService.updateProgramData(programKey, programData);

    // Затем сохраняем в файл
    const fileName = `Резервная копия тренировки_${
      new Date().toISOString().split(".")[0]
    }.json`;
    const jsonContent = JSON.stringify({ [programKey]: programData }, null, 2);

    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    return true;
  } catch (error) {
    console.error("Error saving training data:", error);
    return false;
  }
};

export const restoreTrainingData = async (
  file: File
): Promise<TrainingData | null> => {
  try {
    const text = await file.text();
    const json = JSON.parse(text);

    if (!json) {
      throw new Error("Invalid file format");
    }

    // Синхронизируем данные из файла с localStorage
    Object.keys(json).forEach(key => {
      if (key in PROGRAMS) {
        StorageService.syncFromFile(key as ProgramKey, json);
      }
    });

    return json;
  } catch (error) {
    console.error("Error restoring training data:", error);
    return null;
  }
};

export const transformDataFromFile = (program: ProgramKey, data: TrainingData) => {
  if (program === "MILITARY_POWER") {
    return data.MILITARY_POWER;
  }
  return data;
};
