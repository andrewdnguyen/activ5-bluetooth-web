import { Component } from '@angular/core';

import { A5DeviceManager } from '@h3trika/activ5-device';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  constructor(private A5Device: A5DeviceManager ) {
    this.A5Device.getDevice().subscribe(device => {
      this.device = device;
      if (device) {
        this.deviceName = device.name;
      }
    });
    this.A5Device.getIsometricData().subscribe(data => {
      this.isomData = data;
    });
  }

  public device: BluetoothDevice;
  public deviceName: string;
  public isomData: string;
  public isEvergreenMode = false;

  public connect(): void {
    this.A5Device.connect();
  }

  public startIsometric(): void {
    this.A5Device.startIsometric();
  }

  public tare(): void {
    this.A5Device.tare();
  }

  public stop(): void {
    this.A5Device.stop();
  }

  public evergreenMode(): void {
    this.A5Device.evergreenMode(this.isEvergreenMode);
  }

  public disconnect(): void {
    this.A5Device.disconnect();
  }

}
