import { ProgramData, ExerciseKey } from "../services/types";

/**
 * Проверяет, есть ли данные для указанной даты и упражнения
 * 
 * @param programData Данные программы тренировок
 * @param date Дата для проверки
 * @param exerciseKey Ключ упражнения для проверки
 * @returns true если есть хотя бы один подход с данными для указанной даты и упражнения
 */
export const checkHasDataForDate = (
  programData: ProgramData,
  date: number,
  exerciseKey: ExerciseKey
): boolean => {
  const exerciseData = programData[date]?.[exerciseKey];
  if (!exerciseData) return false;
  // Проверяем, есть ли хотя бы один подход с данными
  return Object.values(exerciseData).some(
    (setData) => Array.isArray(setData) && setData.length > 0
  );
};

/**
 * Проверяет, есть ли хотя бы одна запись с данными для указанного упражнения
 * 
 * @param programData Данные программы тренировок
 * @param exerciseKey Ключ упражнения для проверки
 * @returns true если есть хотя бы один подход с данными для указанного упражнения
 */
export const checkHasTrainingData = (
  programData: ProgramData,
  exerciseKey: ExerciseKey
): boolean => {
  return Object.keys(programData).some((date) => {
    return checkHasDataForDate(programData, Number(date), exerciseKey);
  });
};

