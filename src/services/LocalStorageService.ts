import { TrainingData, ProgramKey, ProgramData } from './types';

const STORAGE_KEY = 'training_data';

export class LocalStorageService {
  static getData(): TrainingData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  static saveData(data: TrainingData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static getProgramData(programKey: ProgramKey): ProgramData | null {
    const data = this.getData();
    return data ? data[programKey] || null : null;
  }

  static saveProgramData(programKey: ProgramKey, data: ProgramData): void {
    const allData = this.getData() || {} as TrainingData;
    allData[programKey] = data;
    this.saveData(allData);
  }
} 