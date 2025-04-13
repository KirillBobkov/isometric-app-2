import { TrainingData } from './types';

export class FileService {
  static async saveToFile(data: TrainingData): Promise<boolean> {
    try {
      const fileName = `Резервная копия тренировки_${
        new Date().toISOString().split(".")[0]
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
      const json = JSON.parse(text);

      if (!json) {
        throw new Error("Invalid file format");
      }

      return json;
    } catch (error) {
      console.error("Error loading training data from file:", error);
      return null;
    }
  }
}
