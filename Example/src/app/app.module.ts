import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import {MatButtonModule} from '@angular/material/';
import {MatSliderModule} from '@angular/material/';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MatButtonModule,
    MatSliderModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
