/**
 * Ограничивает массив последними N элементами
 * 
 * @param array Исходный массив
 * @param maxLength Максимальная длина
 * @returns Массив, ограниченный последними maxLength элементами (или исходный, если он короче)
 */
export const limitArray = <T>(array: T[], maxLength: number): T[] => {
  return array.length > maxLength ? array.slice(-maxLength) : array;
};

