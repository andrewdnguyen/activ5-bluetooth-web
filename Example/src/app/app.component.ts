import { Component } from '@angular/core';

import { A5DeviceManager } from './../../../dist/Activ5-Device';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  constructor(private A5Device: A5DeviceManager ) {
    this.A5Device.getIsometricData().subscribe((data: string) => {
      this.isomData = data;
    });

    this.A5Device.onDisconnect().subscribe((event: Event) => {
      this.device = undefined;
    });
  }

  public device: BluetoothDevice;
  public isomData: string;
  public isEvergreenMode: boolean;

  public connect(): void {
    this.A5Device.connect().then((device: BluetoothDevice) => {
      this.device = device;
    });
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
