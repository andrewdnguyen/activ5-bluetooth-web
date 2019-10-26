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

  public registerOne() {
    console.log("Clicked button 1!");
  }

  public registerTwo() {
    console.log("Clicked button 2!");
  }

  public connect(index: number): void {
    this.manager.connect().then((newDevice: A5Device) => {
      const name = newDevice.device.name;

      for (let i = 0; i < this.devices.length; i++) {
        if (this.devices[i] && this.devices[i].device.name === name) {
          this.devices[i] = undefined;
        }
      }

      this.devices[index] = newDevice;

      let currentInt1 = 0;
      let lastInt1 = 0;
      let currentInt2 = 0;
      let lastInt2 = 0;
      this.devices[index].getIsometricData().subscribe((data: string) => {
        this.isomData[index] = data;
        lastInt1 = currentInt1
        currentInt1 = parseInt(this.isomData[0]);
        let difference1 = currentInt1 - lastInt1;
        if(difference1 > 5){
          this.registerOne();
        }
        lastInt2 = currentInt2
        currentInt2 = parseInt(this.isomData[1]);
        let difference2 = currentInt2 - lastInt2;
        if(difference2 > 5){
          this.registerTwo();
        }
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
