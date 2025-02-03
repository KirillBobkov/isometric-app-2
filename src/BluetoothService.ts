import { from, fromEvent, interval } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";

const serviceUUID = 0xffe0;
const serialUUID = 0xffe1;

type BluetoothRemoteGATTService = any;
type BluetoothDevice = any;
type BluetoothRemoteGATTCharacteristic = any;
type BluetoothRemoteGATTServer = any;

export class BluetoothService {
  private device: BluetoothDevice | null;
  private serialCharacteristic: BluetoothRemoteGATTCharacteristic | null;

  constructor() {
    this.device = null;
    this.serialCharacteristic = null;
  }

  // Подключение к устройству
  public connect() {
    console.log("Запрос на подключение...");

    const device$ = from(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
      navigator.bluetooth.requestDevice({
        filters: [
          {
            services: [serviceUUID],
          },
        ],
      })
    );

    const server$ = device$.pipe(
      tap((d: BluetoothDevice) => {
        this.device = d;
        console.log("Устройство найдено:", d);
      }),
      switchMap((d: BluetoothDevice) => from(d.gatt!.connect())),
      tap(() => console.log("Берем сервис ", serviceUUID)),
      switchMap((server: BluetoothRemoteGATTServer) =>
        from(server.getPrimaryService(serviceUUID))
      ),
      tap(() => console.log("Берем характеристику ", serialUUID)),
      switchMap((service: BluetoothRemoteGATTService) =>
        from(service.getCharacteristic(serialUUID))
      ),
      tap((characteristic: BluetoothRemoteGATTCharacteristic) => {
        this.serialCharacteristic = characteristic;
        console.log("Подписываемся на сообщения");
      })
    );

    const notifications$ = server$.pipe(
      switchMap(() => from(this.serialCharacteristic!.startNotifications())),
      switchMap(() =>
        fromEvent<Event>(this.serialCharacteristic!, "characteristicvaluechanged")
      ),
      map((event: Event) => this.read(event as CustomEvent))
    );

    return notifications$;
  }

  // Отключение от устройства
  public disconnect(): void {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
      console.log("Устройство отключено");
    } else {
      console.log("Устройство уже отключено");
    }
  }

  // Проверка статуса подключения
  public getStatus(): boolean {
    return this.device?.gatt?.connected || false;
  }

  public getStatusMock(): boolean {
    return true;
  }

  // Чтение данных из характеристики
  private read(event: CustomEvent): string {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const value = event.target?.value as DataView;
    const decodedValue = new TextDecoder().decode(value);
    console.log("Прочитано:", decodedValue);
    return decodedValue;
  }

    // Моковый метод для генерации случайных чисел
    public mockNotifications() {
      return interval(400).pipe(
        map(() => Math.floor(Math.random() * 100)), // Генерация случайного числа от 0 до 99
        tap((randomNumber) => console.log("Моковое уведомление:", randomNumber))
      );
    }
}