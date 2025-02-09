declare module './BluetoothService.js' {
  export class BluetoothService {
    connect(): any;
    disconnect(): void;
    getStatus(): boolean;
  }
} 