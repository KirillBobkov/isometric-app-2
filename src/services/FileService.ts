import { TrainingData, ProgramKey, ExerciseKey } from './types';
import { PROGRAMS, EXERCISES } from './types';
import { z } from 'zod';

// Создаем Zod схему для валидации структуры данных
const SetDataPointSchema = z.object({
  t: z.number(),
  w: z.number()
});

const ExerciseDataSchema = z.object({
  maxWeight: z.number().optional()
}).catchall(
  z.array(SetDataPointSchema)
);

const DayDataSchema = z.record(
  z.enum(Object.keys(EXERCISES) as [ExerciseKey, ...ExerciseKey[]]), 
  ExerciseDataSchema
);

const ProgramDataSchema = z.record(
  z.string().transform((val, ctx) => {
    const num = Number(val);
    if (isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Неверный формат даты: ${val}`,
      });
      return z.NEVER;
    }
    return num;
  }),
  DayDataSchema
);

const TrainingDataSchema = z.record(
  z.enum(Object.keys(PROGRAMS) as [ProgramKey, ...ProgramKey[]]),
  ProgramDataSchema
);

export class FileService {
  static async saveToFile(data: TrainingData): Promise<boolean> {
    try {
      const fileName = `Журнал тренировок от ${
        new Date().toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).split('.').join('-')
      }.json`;
      const jsonContent = JSON.stringify(data);

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
      console.error("Error saving training data to file:", error);
      return false;
    }
  }

  static async loadFromFile(file: File): Promise<TrainingData | null> {
    try {
      const text = await file.text();
      const json: unknown = JSON.parse(text);

      const result = TrainingDataSchema.safeParse(json);
      
      if (!result.success) {
        console.error("Ошибки валидации данных:", result.error.format());
        throw new Error("Некорректный формат данных тренировки");
      }

      return result.data;
    } catch (error) {
      console.error("Error loading training data from file:", error);
      return null;
    }
  }
}
