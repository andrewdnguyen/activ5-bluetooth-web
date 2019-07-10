import { Component } from '@angular/core';

import { A5DeviceManager, A5Device } from 'activ5-device';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  public devices: A5Device[] = [];
  public isomData: string[] = [];

  public deviceOneIsEvergreenMode: boolean;
  public deviceTwoIsEvergreenMode: boolean;

  private manager = new A5DeviceManager();

  public connect(index: number): void {
    this.manager.connect().then((newDevice: A5Device) => {
      this.devices[index] = newDevice;

      this.devices[index].getIsometricData().subscribe((data: string) => {
        this.isomData[index] = data;
      });

      this.devices[index].onDisconnect().subscribe((event: Event) => {
        this.devices[index] = undefined;
      });
    });
  }

  public startIsometric(index: number): void {
    this.devices[index].startIsometric();
  }

  public tare(index: number): void {
    this.devices[index].tare();
  }

  public stop(index: number): void {
    this.devices[index].stop();
  }

  public evergreenMode(index: number, isEvergreenMode: boolean): void {
    this.devices[index].evergreenMode(isEvergreenMode);
  }

  public disconnect(index: number): void {
    this.devices[index].disconnect();
  }

}
