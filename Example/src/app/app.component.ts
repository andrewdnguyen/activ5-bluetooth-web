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
  public timeClicked1: number[] = [];
  public pressureList: number[] = [];

  public deviceOneIsEvergreenMode: boolean;
  public deviceTwoIsEvergreenMode: boolean;

  private manager = new A5DeviceManager();
  public currentIso: number;

  public record = false;
  public displayResult1 = false;
  public practiceStuff = false;
  public isHigh = false;


  public sensitivityValue = 100;
  public timeBetweenBeats = 500/0.5;
  public results = -1;
  public compressionAverage = -1;

  formatLabel(value: number) {
    return value;
  }
  
  
  showPractice(){
    this.practiceStuff = true
    
  }

  showResults1(){
    let total = 0; 
    console.log('timeClicked1:', this.timeClicked1);
    for(let i = 1; i < this.timeClicked1.length-1; i++){
      console.log(this.timeClicked1[i]);
      let difference = this.timeClicked1[i] - this.timeClicked1[i-1];
      total = total + difference;
      console.log(total);
    }
    let totalCompression = 0;
    console.log(this.timeClicked1);
    for(let x = 0; x < this.pressureList.length; x++){
      totalCompression = totalCompression + this.pressureList[x];
    }
    let compAverage = totalCompression / this.pressureList.length;
    this.compressionAverage =  Math.trunc(compAverage);
    let average = total / this.timeClicked1.length;
    this.results = Math.trunc(60/((average/1000)));
    this.displayResult1 = true
  }

  public startRecording(){
    this.record = true;
  }

  public stopRecording(){
    this.record = false;
  }

  public registerOne() {
    let date1 = new Date();
    let time1 = date1.getTime();
    console.log(time1);
    console.log(typeof(time1));
    if(this.record === true){
      this.timeClicked1.push(time1);
    }

  }


  public updateSensitivity(event: any) {
    this.sensitivityValue = 100;
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
      this.devices[index].getIsometricData().subscribe((data: string) => {
        this.isomData[index] = data;
        lastInt1 = currentInt1
        currentInt1 = parseInt(this.isomData[0]);
        let difference1 = currentInt1 - lastInt1;
        if(difference1 > (100 - this.sensitivityValue)){
          //if change is large enough, record pressure
          this.pressureList.push(currentInt1);
          this.currentIso = currentInt1;          
          console.log(this.sensitivityValue);
          this.registerOne();
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
