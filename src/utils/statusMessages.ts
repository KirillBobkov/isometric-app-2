import { ActiveMode } from "../types/militaryPower";

export const getStatusMessage = (mode: ActiveMode, isConnected: boolean): string => {
  if (!isConnected) return "Подключите тренажер для начала тренировки";
  
  switch (mode) {
    case ActiveMode.PREPARING:
      return "Приготовьтесь, тренировка сейчас начнется";
    case ActiveMode.REST:
      return "Подход закончен, отдохните перед следующим подходом";
    case ActiveMode.SET:
      return "Выполняйте упражнение с максимальным усилием";
    case ActiveMode.FEEDBACK:
      return "Если вы готовы, то выберите упражнение и нажмите на кнопку 'Начать тренировку'";
    default:
      return "";
  }
}; 