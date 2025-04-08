interface SetDataPoint {
  time: number;
  weight: number;
}

type TrainingData = Record<string, Record<number, SetDataPoint[]>>;

interface ExerciseStats {
  maxWeight: number;
  avgWeight: number;
  setStats: {
    setNumber: number;
    maxWeight: number;
    avgWeight: number;
    dataPoints: number;
  }[];
}

const calculateExerciseStats = (exerciseData: Record<number, SetDataPoint[]>): ExerciseStats => {
  const setStats = Object.entries(exerciseData).map(([setNumber, data]) => {
    const weights = data.map(point => point.weight);
    
    if (weights.length === 0) {
      return {
        setNumber: Number(setNumber),
        maxWeight: 0,
        avgWeight: 0,
        dataPoints: 0
      };
    }
    
    return {
      setNumber: Number(setNumber),
      maxWeight: Math.max(...weights),
      avgWeight: weights.reduce((sum, w) => sum + w, 0) / weights.length,
      dataPoints: weights.length
    };
  });

  const allWeights = Object.values(exerciseData)
    .flatMap(data => data.map(point => point.weight));
  
  if (allWeights.length === 0) {
    return {
      maxWeight: 0,
      avgWeight: 0,
      setStats
    };
  }
  
  return {
    maxWeight: Math.max(...allWeights),
    avgWeight: allWeights.reduce((sum, w) => sum + w, 0) / allWeights.length,
    setStats
  };
};

export const generateTrainingReport = async (trainingData: TrainingData, name: string) => {
  try {
    // Проверяем, есть ли данные для отчета
    const hasAnyData = Object.values(trainingData).some(exerciseData => 
      Object.values(exerciseData).some(setData => setData.length > 0)
    );
    
    if (!hasAnyData) {
      alert("Нет данных для создания отчета. Выполните тренировку сначала.");
      return false;
    }

    let report = `ОТЧЕТ О ТРЕНИРОВКЕ ${name}\n`;
    report += "=================\n\n";
    report += `Дата: ${new Date().toLocaleDateString("ru-RU")}\n`;
    report += `Время создания: ${new Date().toLocaleTimeString("ru-RU")}\n\n`;

    for (const [exercise, exerciseData] of Object.entries(trainingData)) {
      // Проверяем, есть ли данные для этого упражнения
      const hasExerciseData = Object.values(exerciseData).some(setData => setData.length > 0);
      
      if (!hasExerciseData) {
        continue; // Пропускаем упражнения без данных
      }
      
      const stats = calculateExerciseStats(exerciseData);
      
      report += `УПРАЖНЕНИЕ: ${exercise}\n`;
      report += "========================\n";
      report += `Максимальный вес за все подходы: ${stats.maxWeight.toFixed(1)} кг\n`;
      report += `Среднее значение за все подходы: ${stats.avgWeight.toFixed(1)} кг\n\n`;
      
      report += "ДЕТАЛИЗАЦИЯ ПО ПОДХОДАМ:\n";
      stats.setStats.forEach(setStat => {
        if (setStat.dataPoints === 0) {
          report += `\nПодход №${setStat.setNumber}: Нет данных\n`;
        } else {
          report += `\nПодход №${setStat.setNumber}:\n`;
          report += `  - Максимальный вес: ${setStat.maxWeight.toFixed(1)} кг\n`;
          report += `  - Среднее значение: ${setStat.avgWeight.toFixed(1)} кг\n`;
        }
      });
      
      report += "\n=================\n\n";
    }

    const fileName = `Отчет о тренировке от ${new Date().toLocaleDateString("ru-RU")}.txt`;
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    return true;
  } catch (error) {
    console.error("Error generating training report:", error);
    return false;
  }
}; 