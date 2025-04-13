import { ProgramData, ProgramKey, TrainingData } from './FileService';

const STORAGE_KEY = 'training_data';

/**
 * Сервис для работы с локальным хранилищем и синхронизации данных тренировок
 */
export class StorageService {
  /**
   * Получить все данные тренировок из localStorage
   */
  static getTrainingData(): TrainingData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return {};
    }
  }

  /**
   * Сохранить все данные тренировок в localStorage
   */
  static saveTrainingData(data: TrainingData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Получить данные конкретной программы
   */
  static getProgramData(programKey: ProgramKey): ProgramData {
    const data = this.getTrainingData();
    return data[programKey] || {};
  }

  /**
   * Обновить данные программы с мержем существующих данных
   */
  static updateProgramData(programKey: ProgramKey, newData: ProgramData): void {
    const allData = this.getTrainingData();
    const existingData = allData[programKey] || {};

    // Мерж данных по дням
    const mergedData = Object.entries(newData).reduce((acc, [day, dayData]) => {
      const existingDayData = existingData[day] || {};
      
      // Мерж данных по упражнениям
      const mergedDayData = Object.entries(dayData).reduce((dayAcc, [exercise, exerciseData]) => {
        const existingExerciseData = existingDayData[exercise] || {};
        
        // Мерж данных по подходам
        const mergedExerciseData = Object.entries(exerciseData).reduce((exerciseAcc, [set, setData]) => {
          // Если есть новые данные для подхода, используем их
          if (setData && setData.length > 0) {
            exerciseAcc[set] = setData;
          } else if (existingExerciseData[set]) {
            // Иначе сохраняем существующие данные
            exerciseAcc[set] = existingExerciseData[set];
          }
          return exerciseAcc;
        }, {} as Record<string, any>);

        if (Object.keys(mergedExerciseData).length > 0) {
          dayAcc[exercise] = mergedExerciseData;
        }
        return dayAcc;
      }, {} as Record<string, any>);

      if (Object.keys(mergedDayData).length > 0) {
        acc[day] = mergedDayData;
      }
      return acc;
    }, {} as ProgramData);

    // Сохраняем обновленные данные
    allData[programKey] = mergedData;
    this.saveTrainingData(allData);
  }

  /**
   * Синхронизировать данные из файла с localStorage
   */
  static syncFromFile(programKey: ProgramKey, fileData: TrainingData): void {
    const programData = fileData[programKey] || {};
    this.updateProgramData(programKey, programData);
  }
} 