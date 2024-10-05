import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(),
      provideAnimations(), // required animations providers
      provideToastr({
        enableHtml: true,
        timeOut: 10000,
        closeButton:true,
        tapToDismiss:true,
        progressBar: true,

        preventDuplicates: true,
      }), // Toastr providers
    ]
};
