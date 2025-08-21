import { from, fromEvent, interval } from "rxjs";
import { map, switchMap, tap, throttleTime } from "rxjs/operators";

const serviceUUID = 0xffe0;
const serialUUID = 0xffe1;
export const THROTTLE_TIME = 500;
export class BluetoothService {
  constructor() {
    this.device = null;
    this.serialCharacteristic = null;
  }

  // Подключение к устройству
  connect() {
    console.log("Запрос на подключение...");
    const device$ = from(
      navigator.bluetooth.requestDevice({
        filters: [
          {
            services: [serviceUUID],
          },
        ],
      })
    );

    const server$ = device$.pipe(
      tap((d) => {
        this.device = d;
        console.log("Устройство найдено:", d);
      }),
      switchMap((d) => from(d.gatt.connect())),
      tap(() => console.log("Берем сервис ", serviceUUID)),
      switchMap((server) => from(server.getPrimaryService(serviceUUID))),
      tap(() => console.log("Берем характеристику ", serialUUID)),
      switchMap((service) => from(service.getCharacteristic(serialUUID))),
      tap((characteristic) => {
        this.serialCharacteristic = characteristic;
        console.log("Подписываемся на сообщения");
      })
    );

    const notifications$ = server$.pipe(
      switchMap(() => from(this.serialCharacteristic.startNotifications())),
      switchMap(() =>
        fromEvent(this.serialCharacteristic, "characteristicvaluechanged")
      ),
      throttleTime(THROTTLE_TIME),
      map((event) => this.read(event))
    );

    return notifications$;
  }

  // Отключение от устройства
  disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
      console.log("Устройство отключено");
    } else {
      console.log("Устройство уже отключено");
    }
  }

  // Проверка статуса подключения
  getStatus() {
    return this.device?.gatt?.connected || false;
  }

  getStatusMock() {
    return true;
  }

  // Чтение данных из характеристики
  read(event) {
    const value = event.target.value;
    const decoder = new TextDecoder();
    const decodedValue = decoder.decode(value);
    console.log("Прочитано:", decodedValue, 'Отдаем', isNaN(parseFloat(decodedValue)) ? 0 : parseFloat(decodedValue));
    return isNaN(parseFloat(decodedValue)) ? 0 : parseFloat(decodedValue);
  }
}