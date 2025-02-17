interface TrainingData {
  date: string;
  duration: number;
  sets: Record<number, Array<{time: number; weight: number}>>;
  maxWeight: number;
  maxWeightPerSet: Record<number, number>;
}

interface SaveTrainingInput {
  trainingData: Record<number, Array<{time: number; weight: number}>>;
  time: number;
}

const formatTrainingDataToText = (data: TrainingData): string => {
  const date = new Date(data.date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  let text = `Отчет о тренировке "Солдатская мощь"\n`;
  text += `Дата: ${date}\n`;
  text += `Общая длительность: ${Math.round(data.duration / 1000)} секунд\n`;
  text += `Максимальный вес за тренировку: ${data.maxWeight.toFixed(1)} кг\n\n`;
  
  text += `Результаты по подходам:\n`;
  text += `==========================================\n\n`;
  
  Object.entries(data.sets).forEach(([setNumber, setData]) => {
    const setMaxWeight = data.maxWeightPerSet[Number(setNumber)];
    const avgWeight = setData.reduce((sum, point) => sum + point.weight, 0) / setData.length;
    
    text += `Подход №${setNumber}\n`;
    text += `------------------------------------------\n`;
    text += `Максимальный вес: ${setMaxWeight.toFixed(1)} кг\n`;
    text += `Средний вес: ${avgWeight.toFixed(1)} кг\n`;
    text += `Количество измерений: ${setData.length}\n\n`;
  });
  
  text += `==========================================\n`;
  text += `Заметки:\n`;
  text += `1. Максимальное усилие: ${data.maxWeight.toFixed(1)} кг\n`;
  text += `2. Лучший подход: №${Object.entries(data.maxWeightPerSet)
    .reduce((best, [set, weight]) => weight > data.maxWeightPerSet[best] ? set : best, '1')}\n`;
  
  return text;
};

const prepareTrainingData = (input: SaveTrainingInput): TrainingData => {
  const maxWeightPerSet = Object.entries(input.trainingData).reduce((acc, [set, data]) => {
    acc[Number(set)] = data.reduce((max, point) => Math.max(max, point.weight), 0);
    return acc;
  }, {} as Record<number, number>);

  const maxWeight = Object.values(input.trainingData)
    .flat()
    .reduce((max, point) => Math.max(max, point.weight), 0);

  return {
    date: new Date().toISOString().split('T')[0],
    duration: input.time,
    sets: input.trainingData,
    maxWeight,
    maxWeightPerSet
  };
};

export const saveTrainingData = async (data: SaveTrainingInput) => {
  try {
    const preparedData = prepareTrainingData({
      trainingData: data.trainingData,
      time: data.time
    });

    const formattedDate = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric"
}).replace(/\./g, ',');
    
    const fileName = `Запись тренировки ${formattedDate}.txt`;
    const textContent = formatTrainingDataToText(preparedData);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });

    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'Text Files',
          accept: {
            'text/plain': ['.txt'],
          },
        }],
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();

      return true;
    } catch {
      // Fallback для браузеров без поддержки File System Access API
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      return true;
    }
  } catch (error) {
    console.error('Error saving training data:', error);
    return false;
  }
}; 