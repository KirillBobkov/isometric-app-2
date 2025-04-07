import { Observable } from 'rxjs';

export declare class BluetoothService {
  connect(): Observable<string>;
  disconnect(): void;
  getStatus(): boolean;
} 