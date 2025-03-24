type SoundKey = 'prepare' | 'start' | 'rest' | 'finish' | 'connect' | 'disconnect';

import beforeStartTrainingSound from '../audio/beforeStartTraining.mp3';
import startSound from '../audio/start.mp3';
import rest1minSound from '../audio/rest1min.mp3';
import connectSound from '../audio/connect.mp3';
import finishSound from '../audio/finish.mp3';
import disconnectSound from '../audio/disconnect.mp3';
export class SoundService {
  private sounds: Map<SoundKey, HTMLAudioElement> = new Map();
  private initialized: boolean = false;
  private isPlaying: boolean = false;

  constructor() {
    this.sounds = new Map();
  }

  // Инициализация звуков
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const soundFiles: Record<SoundKey, string> = {
      prepare: beforeStartTrainingSound,
      start: startSound,
      rest: rest1minSound,
      finish: finishSound,
      connect: connectSound,
      disconnect: disconnectSound
    };

    try {
      for (const [key, path] of Object.entries(soundFiles)) {
        const audio = new Audio(path);
        await new Promise((resolve, reject) => {
          audio.addEventListener('loadedmetadata', resolve);
          audio.addEventListener('error', reject);
          audio.load();
        });
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

    // Если уже что-то воспроизводится, ждем завершения
    while (this.isPlaying) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const sound = this.sounds.get(key);
    if (sound) {
      try {
        this.isPlaying = true;
        sound.currentTime = 0;
        await sound.play();
        // Ждем окончания воспроизведения
        await new Promise(resolve => {
          sound.addEventListener('ended', resolve, { once: true });
        });
      } catch (error) {
        console.error(`Failed to play sound ${key}:`, error);
      } finally {
        this.isPlaying = false;
      }
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
