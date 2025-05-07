import { describe, it, beforeEach, expect } from 'vitest';
import { StorageService } from './StorageService';
import { TrainingData, ProgramKey, ProgramData } from './types';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';

const sampleTrainingData: TrainingData = {
  IRON_MAN: {
    134234: {
      DEADLIFT: {
        maxWeight: 100,
        1: [{ t: 1, w: 100 }]
      }
    }
  }
};
const sampleProgramKey: ProgramKey = 'IRON_MAN';
const sampleProgramData: ProgramData = {
  134234: {
    DEADLIFT: {
      1: [{ t: 1, w: 100 }],
      2: [{ t: 2, w: 100 }],
      3: [{ t: 3, w: 100 }],
    },
    BICEPS_CURL: {
      1: [{ t: 1, w: 100 }],
      2: [{ t: 2, w: 100 }],
      3: [{ t: 3, w: 100 }],
    },
  }
};

describe('StorageService', () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
    globalThis.IDBKeyRange = IDBKeyRange;
  });

  it('saveData и getData работают корректно', async () => {
    await StorageService.saveData(sampleTrainingData);
    const data = await StorageService.getData();
    expect(data).toEqual(sampleTrainingData);
  });

  it('getData возвращает null если данных нет', async () => {
    const data = await StorageService.getData();
    expect(data).toBeNull();
  });

  it('saveData кидает ошибку при невалидных данных', async () => {
    const badData = { bad: 'data' } as any;
    await expect(StorageService.saveData(badData)).rejects.toThrow();
  });

  it('saveProgramData и getProgramData работают корректно', async () => {
    await StorageService.saveProgramData(sampleProgramKey, sampleProgramData);
    const data = await StorageService.getProgramData(sampleProgramKey);
    expect(data).toEqual(sampleProgramData);
  });

  it('getProgramData возвращает null если программы нет', async () => {
    await StorageService.saveData(sampleTrainingData);
    const data = await StorageService.getProgramData('MILITARY_POWER' as ProgramKey);
    expect(data).toBeNull();
  });

  it('saveProgramData кидает ошибку при невалидных данных', async () => {
    const badProgramData = { bad: 'data' } as any;
    await expect(
      StorageService.saveProgramData(sampleProgramKey, badProgramData)
    ).rejects.toThrow();
  });
}); 