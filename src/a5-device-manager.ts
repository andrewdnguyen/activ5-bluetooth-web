/// <reference path="index.d.ts" />

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

enum DeviceUUID {
  SERVICE = '00005000-0000-1000-8000-00805f9b34fb',
  READ = '00005a01-0000-1000-8000-00805f9b34fb',
  WRITE = '00005a02-0000-1000-8000-00805f9b34fb'
}

enum DeviceCommands {
  TVGTIME = 'TVGTIME',
  ISOM = 'ISOM!',
  TARE = 'TARE!',
  STOP = 'STOP!'
}

enum DeviceState {
  handshake = 'handshake',
  isometric = 'isometric',
  stop = 'stop',
  disconnected = 'disconnected'
}

@Injectable({
  providedIn: 'root'
})

export class A5DeviceManager {

  private device: BluetoothDevice;

  private disconnectEventAsObservable = new Subject<Event>();

  private server: BluetoothRemoteGATTServer;
  private service: BluetoothRemoteGATTService;

  private isomDataAsObservable = new Subject<string>();

  private evergreenModeTimer: number;
  private characteristics = new Map();
  private deviceState = DeviceState.disconnected;

  public getIsometricData(): Observable<string> {
    return this.isomDataAsObservable.asObservable();
  }

  public onDisconnect(): Observable<Event> {
    return this.disconnectEventAsObservable.asObservable();
  }

  public async connect(): Promise<BluetoothDevice> {

    if (window.navigator && window.navigator.bluetooth) {
      let device: BluetoothDevice;

      if (!this.device) {
        device = await navigator.bluetooth.requestDevice({ filters: [{ services: [DeviceUUID.SERVICE] }] });
      }

      if (!this.server) {
        this.server = await device.gatt.connect();
      }

      if (!this.service) {
        this.service = await this.server.getPrimaryService(DeviceUUID.SERVICE);
      }

      await this.cacheCharacteristic(DeviceUUID.READ);
      await this.cacheCharacteristic(DeviceUUID.WRITE);

      await this.writeCharacteristicValue(this.formatCommand(DeviceCommands.TVGTIME));

      this.device = device;
      this.deviceState = DeviceState.handshake;
      this.attachDisconnectListener();

      return this.device;
    }
  }

  public async startIsometric(): Promise<void> {
    await this.writeCharacteristicValue(this.formatCommand(DeviceCommands.ISOM));
    this.deviceState = DeviceState.isometric;

    const characteristic = await this.startNotifications();
    this.attachIsometricListener(characteristic);
  }

  public tare(): void {
    this.writeCharacteristicValue(this.formatCommand(DeviceCommands.TARE));
  }

  public async stop(): Promise<void> {
    await this.writeCharacteristicValue(this.formatCommand(DeviceCommands.STOP));
    this.deviceState = DeviceState.stop;
  }

  public evergreenMode(isEvergreenMode: boolean): void {
    if (isEvergreenMode) {
      this.evergreenModeTimer = window.setInterval(() => {
        switch (this.deviceState) {
          case DeviceState.stop: case DeviceState.handshake:
            this.stop();
            break;
          default:
            break;
        }
      }, 60000);
    } else {
      clearInterval(this.evergreenModeTimer);
    }
  }

  public disconnect(): void {
    this.device.gatt.disconnect();
  }

  private attachDisconnectListener(): void {
    this.device.addEventListener('gattserverdisconnected', (event: Event) => {
      this.disconnectEventAsObservable.next(event);
      this.deviceState = DeviceState.disconnected;
      this.device = undefined;
      this.server = undefined;
      this.service = undefined;
    });
  }

  private async cacheCharacteristic(characteristicUuid: string): Promise<void> {
    const characteristic = await this.service.getCharacteristic(characteristicUuid);
    this.characteristics.set(characteristicUuid, characteristic);
  }

  private writeCharacteristicValue(value: DataView): Promise<void> {
    const characteristic = this.characteristics.get(DeviceUUID.WRITE);
    return characteristic.writeValue(value);
  }

  private startNotifications(): Promise<BluetoothRemoteGATTCharacteristic> {
    const characteristic = this.characteristics.get(DeviceUUID.READ);
    return characteristic.startNotifications();
  }

  private attachIsometricListener(characteristic: BluetoothRemoteGATTCharacteristic): void {
    characteristic.addEventListener('characteristicvaluechanged', event => {
      const target = event.target as BluetoothRemoteGATTCharacteristic;
      this.parseData(target.value);
    });
  }

  private parseData(data: DataView): void {
    const deviceDataAsString = String.fromCharCode.apply(null, new Uint8Array(data.buffer));
    const isomData = deviceDataAsString.match(/IS(.*)\/IS/)[1];

    this.isomDataAsObservable.next(isomData);
  }

  private formatCommand(type: string): DataView {
    const buffer = new ArrayBuffer(type.length + 2);
    const dataView = new DataView(buffer, 0);

    dataView.setUint8(0, 65);

    for (let i = 0; i < type.length; i++) {
        dataView.setUint8(i + 1, type.charCodeAt(i));
    }

    dataView.setUint8(type.length + 1, 25);

    return dataView;
  }

}
