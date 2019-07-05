/// <reference path="index.d.ts" />
import { Observable } from 'rxjs';
export declare class A5DeviceManager {
    private device;
    private deviceAsObservable;
    private server;
    private service;
    private isomDataAsObservable;
    private evergreenModeTimer;
    private characteristics;
    private deviceState;
    getDevice(): Observable<BluetoothDevice>;
    getIsometricData(): Observable<string>;
    connect(): Promise<void>;
    startIsometric(): Promise<void>;
    tare(): void;
    stop(): Promise<void>;
    evergreenMode(isEvergreenMode: boolean): void;
    disconnect(): Promise<void>;
    private cacheCharacteristic;
    private writeCharacteristicValue;
    private startNotifications;
    private attachListener;
    private parseData;
    private formatCommand;
}
