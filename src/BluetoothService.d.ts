import { Observable } from 'rxjs';

declare module './services/BluetoothService.js' {
  export class BluetoothService {
    connect(): Observable<string>;
    disconnect(): void;
    getStatus(): boolean;
  }
} 