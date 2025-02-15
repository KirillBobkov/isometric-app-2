import { from, interval } from "rxjs";
import { map, switchMap, tap, throttleTime } from "rxjs/operators";

export class MockBluetoothService {
  private device: any = null;
  private serialCharacteristic: any = null;

  constructor() {
    this.device = null;
    this.serialCharacteristic = null;
  }

  connect() {
    console.log("Запрос на подключение...");
    
    // Эмулируем запрос устройства
    const device$ = from(new Promise((resolve) => {
      setTimeout(() => {
        this.device = {
          gatt: {
            connected: true,
            connect: () => Promise.resolve({
              getPrimaryService: () => Promise.resolve({
                getCharacteristic: () => Promise.resolve({
                  startNotifications: () => Promise.resolve(),
                  addEventListener: (event: string, callback: any) => {
                    // Сохраняем callback для использования в эмуляции данных
                    this.serialCharacteristic = {
                      eventCallback: callback
                    };
                  }
                })
              })
            }),
            disconnect: () => {
              this.device.gatt.connected = false;
            }
          }
        };
        resolve(this.device);
      }, 1000);
    }));

    const server$ = device$.pipe(
      tap((d) => {
        this.device = d;
        console.log("Устройство найдено:", d);
      }),
      switchMap((d) => from(d.gatt.connect())),
      tap(() => console.log("Берем сервис ", 0xffe0)),
      switchMap((server) => from(server.getPrimaryService(0xffe0))),
      tap(() => console.log("Берем характеристику ", 0xffe1)),
      switchMap((service) => from(service.getCharacteristic(0xffe1))),
      tap((characteristic) => {
        this.serialCharacteristic = characteristic;
        console.log("Подписываемся на сообщения");
      })
    );

    // Эмулируем поток данных
    const notifications$ = server$.pipe(
      switchMap(() => from(this.serialCharacteristic.startNotifications())),
      switchMap(() => interval(100)),
      map(() => {
        // Создаем событие с эмулированными данными
        const mockEvent = {
          target: {
            value: this.generateMockData()
          }
        };
        return this.read(mockEvent);
      }),
      throttleTime(500),
    );

    return notifications$;
  }

  disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
      console.log("Устройство отключено");
    } else {
      console.log("Устройство уже отключено");
    }
  }

  getStatus() {
    return this.device?.gatt?.connected || false;
  }

  read(event: any) {
    const value = event.target.value;
    const decoder = new TextDecoder();
    const decodedValue = decoder.decode(value);
    // console.log("Прочитано:", decodedValue);
    
    return decodedValue;
  }

  private generateMockData(): Uint8Array {
    // Генерация случайных значений с некоторой логикой
    const baseValue = 20;
    const noise = Math.random() * 10;
    const trend = Math.sin(Date.now() / 1000) * 5;
    const value = Math.max(0, Math.round(baseValue + noise + trend));
    
    // Преобразуем число в строку и затем в Uint8Array
    const encoder = new TextEncoder();
    return encoder.encode(value.toString());
  }
} 