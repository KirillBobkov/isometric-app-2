/// <reference types="vitest/globals" />
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileService } from './FileService';
import type { TrainingData } from './types';

const programKey = 'IRON_MAN';
const exerciseKey = 'DEADLIFT';

const validData: TrainingData = {
  [programKey]: {
    20240101: {
      [exerciseKey]: {
        0: [{ t: 1, w: 100 }]
      }
    }
  }
};

describe('FileService', () => {
  describe('saveToFile', () => {
    beforeEach(() => {
      // @ts-expect-error: Blob is not available in jsdom, mocking for test
      globalThis.Blob = class {
        constructor(public content: any[], public options: any) {}
      };
      document.body.innerHTML = '';
    });

    it('создаёт и кликает по ссылке', async () => {
      const appendSpy = vi.spyOn(document.body, 'appendChild');
      const removeSpy = vi.spyOn(document.body, 'removeChild');
      const clickMock = vi.fn();
      globalThis.URL.createObjectURL = vi.fn(() => 'blob:url');
      globalThis.URL.revokeObjectURL = vi.fn();

      // Создаём реальный <a> и мокаем нужные методы
      const realLink = document.createElement('a');
      Object.defineProperty(realLink, 'click', { value: clickMock });
      document.createElement = vi.fn(() => realLink);

      const result = await FileService.saveToFile(validData);

      expect(result).toBe(true);
      expect(appendSpy).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();
      expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('возвращает false при ошибке', async () => {
      document.createElement = () => { throw new Error('fail') };
      const result = await FileService.saveToFile(validData);
      expect(result).toBe(false);
    });
  });

  describe('loadFromFile', () => {
    it('парсит валидный файл', async () => {
      const file = {
        text: async () => JSON.stringify(validData)
      } as unknown as File;

      const result = await FileService.loadFromFile(file);
      expect(result).toEqual(validData);
    });

    it('возвращает null при невалидном JSON', async () => {
      const file = {
        text: async () => '{invalid json}'
      } as unknown as File;

      const result = await FileService.loadFromFile(file);
      expect(result).toBeNull();
    });

    it('возвращает null при ошибке схемы', async () => {
      const file = {
        text: async () => JSON.stringify({ foo: 'bar' })
      } as unknown as File;

      const result = await FileService.loadFromFile(file);
      expect(result).toBeNull();
    });
  });
}); 