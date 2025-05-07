/**
 * Форматирует временную метку в строку с датой вида "10 января 2023"
 * 
 * @param timestamp Временная метка в миллисекундах
 * @returns Отформатированная строка даты на русском языке
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}; 