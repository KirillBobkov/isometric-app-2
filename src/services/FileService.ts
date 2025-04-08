interface SetDataPoint {
  time: number;
  weight: number;
}

type TrainingData = Record<string, Record<number, SetDataPoint[]>>;

export const saveTrainingData = async (trainingData: TrainingData) => {
  try {
    const fileName = `Резервная копия тренировки_${new Date().toISOString().split('.')[0]}.json`;
    const jsonContent = JSON.stringify(trainingData, null, 2);

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

export const restoreTrainingData = async (file: File): Promise<TrainingData | null> => {
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    
    if (!json) {
      throw new Error('Invalid file format');
    }

    return json;
  } catch (error) {
    console.error("Error restoring training data:", error);
    return null;
  }
};
