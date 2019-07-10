/// <reference path="index.d.ts" />
import { Observable } from 'rxjs';
export declare class A5DeviceManager {
    connect(): Promise<A5Device>;
}
export declare class A5Device {
    constructor(device: BluetoothDevice, server: BluetoothRemoteGATTServer, service: BluetoothRemoteGATTService);
    private device;
    private server;
    private service;
    private disconnectEventAsObservable;
    private isomDataAsObservable;
    private evergreenModeTimer;
    private characteristics;
    private deviceState;
    getIsometricData(): Observable<string>;
    onDisconnect(): Observable<Event>;
    startIsometric(): Promise<void>;
    tare(): void;
    stop(): Promise<void>;
    evergreenMode(isEvergreenMode: boolean): void;
    disconnect(): void;
    private init;
    private attachDisconnectListener;
    private cacheCharacteristic;
    private writeCharacteristicValue;
    private startNotifications;
    private attachIsometricListener;
    private parseData;
    private formatCommand;
}
