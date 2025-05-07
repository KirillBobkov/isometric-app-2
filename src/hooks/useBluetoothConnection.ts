import { useEffect, useState, useRef } from "react";
import { soundService } from "../services/SoundService";

// Можно передавать любой сервис, по умолчанию — MockBluetoothService
export function useBluetoothConnection(bluetoothService: any) {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState<string>("0");
  const subscriptionRef = useRef<any>(null);

  // Подключение к устройству
  const handleConnect = async () => {
    try {
      const notifications$ = bluetoothService.connect();
      subscriptionRef.current = notifications$.subscribe({
        next: (value: any) => {
          setMessage(value);
        },
        error: (err: any) => {
          console.error("Ошибка при получении данных:", err);
        },
      });
    } catch (error) {
      console.error("Ошибка подключения:", error);
    }
  };

  // Отключение от устройства
  const handleDisconnect = () => {
    bluetoothService.disconnect();
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  };

  // Обновление статуса подключения
  useEffect(() => {
    const interval = setInterval(() => {
      const status = bluetoothService.getStatus();
      if (connected !== status) {
        setConnected(status);
        const bodyElement = document.querySelector("body");
        if (bodyElement) {
          bodyElement.click();
        }
        soundService.play(status ? "sound_connect" : "sound_disconnect");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [connected, bluetoothService]);

  // Чистим подписку при размонтировании
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    connected,
    message,
    handleConnect,
    handleDisconnect,
  };
} 