import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(),
    {provide: LocationStrategy, useClass: HashLocationStrategy},
      provideAnimations(), // required animations providers
      provideToastr({
        enableHtml: true,
        progressAnimation:'increasing',
        timeOut: 2000,
        closeButton:true,
        tapToDismiss:true,
        progressBar: true,
        positionClass: 'toast-custom-rigth',
        preventDuplicates: true,
        
      }), // Toastr providers
    ]
};
