import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { FormsModule} from "@angular/forms";
import { AppComponent } from './app.component';
import {CoreModule} from "./core/core.module";


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    FormsModule,
    Ng2ImgMaxModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
