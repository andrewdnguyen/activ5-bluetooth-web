/// <reference path="index.d.ts" />
import { Observable } from 'rxjs';
export declare class A5DeviceManager {
    private device;
    private disconnectEventAsObservable;
    private server;
    private service;
    private isomDataAsObservable;
    private evergreenModeTimer;
    private characteristics;
    private deviceState;
    getIsometricData(): Observable<string>;
    onDisconnect(): Observable<Event>;
    connect(): Promise<BluetoothDevice>;
    startIsometric(): Promise<void>;
    tare(): void;
    stop(): Promise<void>;
    evergreenMode(isEvergreenMode: boolean): void;
    disconnect(): void;
    private attachDisconnectListener;
    private cacheCharacteristic;
    private writeCharacteristicValue;
    private startNotifications;
    private attachIsometricListener;
    private parseData;
    private formatCommand;
}
