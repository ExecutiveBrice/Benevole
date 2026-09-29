import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Les anciens QR codes et courriels pointent vers /#/... ; conserver leur route
// tout en retirant le # de l'adresse avant le démarrage du routeur Angular.
if (window.location.hash.startsWith('#/') && !window.location.hash.startsWith('#//')) {
  window.history.replaceState(window.history.state, '', window.location.hash.slice(1));
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
