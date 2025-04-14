type SoundKey =
  | "sound_prepare"
  | "sound_rest_60_sec"
  | "sound_training_finish"
  | "sound_connect"
  | "sound_disconnect"
  | "sound_prepare_with_max"
  | "sound_start_with_max"
  | "sound_start_with_120_sec"
  | "sound_start_with_60_sec"
  | "sound_exersise_finished"
  | "sound_go_high"
  | "sound_go_low";

import sound_prepare from "../assets/audio/before_start_training.mp3";
import sound_start_with_max from "../assets/audio/start_with_max.mp3";
import sound_rest_60_sec from "../assets/audio/rest_60_sec.mp3";
import sound_connect from "../assets/audio/connect.mp3";
import sound_training_finish from "../assets/audio/training_finish.mp3";
import sound_disconnect from "../assets/audio/disconnect.mp3";
import sound_prepare_with_max from "../assets/audio/prepare_with_max.mp3";
import sound_start_with_120_sec from "../assets/audio/start_with_120_sec.mp3";
import sound_start_with_60_sec from "../assets/audio/start_with_60_sec.mp3";
import sound_exersise_finished from "../assets/audio/exersise_finished.mp3";
import sound_go_high from "../assets/audio/go_high.mp3";
import sound_go_low from "../assets/audio/go_low.wav";

export class SoundService {
  private sounds: Map<SoundKey, HTMLAudioElement> = new Map();
  private initialized: boolean = false;
  private currentlyPlayingKey: SoundKey | null = null;
  
  // Приоритеты звуков (выше число = выше приоритет)
  private priorities: Record<SoundKey, number> = {
    sound_prepare: 10,
    sound_start_with_max: 10,
    sound_rest_60_sec: 10,
    sound_training_finish: 10,
    sound_connect: 11,
    sound_disconnect: 11,
    sound_prepare_with_max: 10,
    sound_start_with_120_sec: 10,
    sound_start_with_60_sec: 10,
    sound_exersise_finished: 10,
    sound_go_high: 9,
    sound_go_low: 9
  };

  constructor() {
    this.sounds = new Map();
  }

  // Инициализация звуков
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const soundFiles: Record<SoundKey, string> = {
      sound_prepare: sound_prepare,
      sound_start_with_max: sound_start_with_max,
      sound_rest_60_sec: sound_rest_60_sec,
      sound_training_finish: sound_training_finish,
      sound_connect: sound_connect,
      sound_disconnect: sound_disconnect,
      sound_prepare_with_max: sound_prepare_with_max,
      sound_start_with_120_sec: sound_start_with_120_sec,
      sound_start_with_60_sec: sound_start_with_60_sec,
      sound_exersise_finished: sound_exersise_finished,
      sound_go_high: sound_go_high,
      sound_go_low: sound_go_low,
    };

    try {
      for (const [key, path] of Object.entries(soundFiles)) {
        const audio = new Audio(path);
        await new Promise((resolve, reject) => {
          audio.addEventListener("loadedmetadata", resolve);
          audio.addEventListener("error", reject);
          audio.load();
        });
        this.sounds.set(key as SoundKey, audio);
      }
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize sounds:", error);
    }
  }

  // Воспроизведение звука с учетом приоритета
  async play(key: SoundKey): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Если запрашивается тот же звук, который уже играет - игнорируем запрос (батчинг)
    if (this.currentlyPlayingKey === key) {
      return;
    }

    const sound = this.sounds.get(key);
    if (!sound) return;

    // Если ничего не играет - просто воспроизводим звук
    if (!this.currentlyPlayingKey) {
      this.playSound(key, sound);
      return;
    }

    // Проверяем приоритеты
    const currentPriority = this.priorities[this.currentlyPlayingKey];
    const newPriority = this.priorities[key];

    if (newPriority === currentPriority) {
      this.stopAll();
      this.playSound(key, sound);
    }

    // Если новый звук имеет приоритет выше - останавливаем текущий и запускаем новый
    if (newPriority > currentPriority) {
      this.stopAll();
      this.playSound(key, sound);
    }
    // Если приоритет ниже - игнорируем запрос
  }

  // Вспомогательный метод для воспроизведения звука
  private playSound(key: SoundKey, sound: HTMLAudioElement): void {
    this.currentlyPlayingKey = key;
    sound.currentTime = 0;
    
    // Устанавливаем обработчик окончания воспроизведения
    sound.onended = () => {
      this.currentlyPlayingKey = null;
    };
    
    // Запускаем воспроизведение
    sound.play().catch(error => {
      console.error(`Failed to play sound ${key}:`, error);
      this.currentlyPlayingKey = null;
    });
  }

  // Остановка звука
  stop(key: SoundKey): void {
    const sound = this.sounds.get(key);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
      if (this.currentlyPlayingKey === key) {
        this.currentlyPlayingKey = null;
      }
    }
  }

  // Остановка всех звуков
  stopAll(): void {
    this.sounds.forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
    this.currentlyPlayingKey = null;
  }

  // Изменение приоритета звука
  setPriority(key: SoundKey, priority: number): void {
    if (key in this.priorities) {
      this.priorities[key] = priority;
    }
  }
}

export const soundService = new SoundService();
