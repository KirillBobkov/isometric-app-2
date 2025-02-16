interface TrainingData {
  date: string;
  duration: number;
  sets: Record<number, Array<{time: number; weight: number}>>;
  maxWeight: number;
  maxWeightPerSet: Record<number, number>;
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

export const saveTrainingData = async (data: TrainingData) => {
  try {
    const formattedDate = new Date(data.date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '-');
    
    const fileName = `training_${formattedDate}.txt`;
    const textContent = formatTrainingDataToText(data);
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