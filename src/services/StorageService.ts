import {
  TrainingData,
  ProgramKey,
  ProgramData,
} from "./types";
import { TrainingDataSchema, ProgramDataSchema } from './FileService';

const DB_NAME = "training_data_db";
const STORE_NAME = "training_data_store";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class StorageService {
  static async getData(): Promise<TrainingData | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get("all");
      req.onsuccess = () => {
        const raw = req.result ?? null;
        if (!raw) return resolve(null);
        const parsed = TrainingDataSchema.safeParse(raw);
        if (!parsed.success) {
          console.error(
            "Ошибка валидации TrainingData:",
            parsed.error.format()
          );
          return resolve(null);
        }
        resolve(parsed.data);
      };
      req.onerror = () => reject(req.error);
    });
  }

  static async saveData(data: TrainingData): Promise<void> {
    const parsed = TrainingDataSchema.safeParse(data);
    if (!parsed.success) {
      console.error(
        "Ошибка валидации TrainingData при сохранении:",
        parsed.error.format()
      );
      throw new Error("Некорректный формат данных тренировки");
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(parsed.data, "all");
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  static async getProgramData(
    programKey: ProgramKey
  ): Promise<ProgramData | null> {
    const allData = await this.getData();
    if (!allData) return null;
    const programData = allData[programKey] ?? null;
    if (!programData) return null;
    const parsed = ProgramDataSchema.safeParse(programData);
    if (!parsed.success) {
      console.error("Ошибка валидации ProgramData:", parsed.error.format());
      return null;
    }
    return parsed.data;
  }

  static async saveProgramData(
    programKey: ProgramKey,
    data: ProgramData
  ): Promise<void> {
    const parsed = ProgramDataSchema.safeParse(data);
    if (!parsed.success) {
      console.error(
        "Ошибка валидации ProgramData при сохранении:",
        parsed.error.format()
      );
      throw new Error("Некорректный формат данных программы");
    }
    const allData = (await this.getData()) || ({} as TrainingData);
    allData[programKey] = parsed.data;
    await this.saveData(allData);
  }
}
