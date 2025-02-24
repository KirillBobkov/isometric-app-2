type SoundKey = 'prepare' | 'start' | 'rest' | 'finish' | 'connect' | 'disconnect';

import beforeStartTrainingSound from '../audio/beforeStartTraining.mp3';
import startSound from '../audio/start.mp3';
import rest1minSound from '../audio/rest1min.mp3';
import connectSound from '../audio/connect.mp3';
import finishSound from '../audio/finish.mp3';
import disconnectSound from '../audio/disconnect.mp3';
export class SoundService {
  private sounds: Map<SoundKey, HTMLAudioElement>;
  private initialized: boolean = false;

  constructor() {
    this.sounds = new Map();
  }

  // Инициализация звуков
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const soundFiles: Record<SoundKey, string> = {
      prepare: beforeStartTrainingSound,  // Сигнал подготовки
      start: startSound,      // Сигнал начала подхода
      rest: rest1minSound,        // Сигнал отдыха
      finish: finishSound,   // Сигнал окончания тренировки
      connect: connectSound,
      disconnect: disconnectSound
    };

    try {
      for (const [key, path] of Object.entries(soundFiles)) {
        const audio = new Audio(path);
        await audio.load(); // Предзагружаем аудио
        this.sounds.set(key as SoundKey, audio);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize sounds:', error);
    }
  }

  // Воспроизведение звука
  async play(key: SoundKey): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    const sound = this.sounds.get(key);


    if (sound) {
      try {
        sound.currentTime = 0; // Сбрасываем время воспроизведения
        await sound.play();
      } catch (error) {
      
        console.error(`Failed to play sound ${key}:`, error);
      }
    } else {
      console.warn(`Sound ${key} not found`);
    }
  }

  // Остановка звука
  stop(key: SoundKey): void {
    const sound = this.sounds.get(key);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  // Остановка всех звуков
  stopAll(): void {
    this.sounds.forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }
}

export const soundService = new SoundService();
