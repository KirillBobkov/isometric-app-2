type SoundKey =
  | "prepare"
  | "rest"
  | "finish"
  | "connect"
  | "disconnect"
  | "prepare_with_max"
  | "start_with_max"
  | "start_with_120_sec"
  | "start_with_60_sec"
  | "exersise_finished"
  | "go_high"
  | "go_low";

import beforeStartTrainingSound from "../assets/audio/beforeStartTraining.mp3";
import startWithMaxSound from "../assets/audio/start_with_max.mp3";
import rest1minSound from "../assets/audio/rest1min.mp3";
import connectSound from "../assets/audio/connect.mp3";
import finishSound from "../assets/audio/finish.mp3";
import disconnectSound from "../assets/audio/disconnect.mp3";
import prepareWithMaxSound from "../assets/audio/prepare_with_max.mp3";
import startWith120SecSound from "../assets/audio/start_with_120sec.mp3";
import startWith60SecSound from "../assets/audio/start_with_60sec.mp3";
import exersiseFinishedSound from "../assets/audio/exersiseFinished.mp3";
import goHighSound from "../assets/audio/go_high.mp3";
import goLowSound from "../assets/audio/go_low.mp3";

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
      start_with_max: startWithMaxSound,
      rest: rest1minSound,
      finish: finishSound,
      connect: connectSound,
      disconnect: disconnectSound,
      prepare_with_max: prepareWithMaxSound,
      start_with_120_sec: startWith120SecSound,
      start_with_60_sec: startWith60SecSound,
      exersise_finished: exersiseFinishedSound,
      go_high: goHighSound,
      go_low: goLowSound,
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

  // Воспроизведение звука
  async play(key: SoundKey): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Если уже что-то воспроизводится, ждем завершения
    while (this.isPlaying) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const sound = this.sounds.get(key);
    if (sound) {
      try {
        this.isPlaying = true;
        sound.currentTime = 0;
        await sound.play();
        // Ждем окончания воспроизведения
        await new Promise((resolve) => {
          sound.addEventListener("ended", resolve, { once: true });
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
    this.sounds.forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
  }
}

export const soundService = new SoundService();
