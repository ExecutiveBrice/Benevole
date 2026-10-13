import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Les anciens QR codes et courriels pointent vers /#/... ; conserver leur route
// tout en retirant le # de l'adresse avant le démarrage du routeur Angular.
if (window.location.hash.startsWith('#/') && !window.location.hash.startsWith('#//')) {
  window.history.replaceState(window.history.state, '', window.location.hash.slice(1));
}

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    if ('serviceWorker' in navigator) {
      let reloadingForServiceWorker = false;
      let hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // La première installation ne doit pas interrompre l'échange d'un lien
        // personnel à usage unique en cours. Recharger uniquement les mises à jour.
        if (hadController && !reloadingForServiceWorker) {
          reloadingForServiceWorker = true;
          window.location.reload();
        }
        hadController = true;
      });

      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((registration) => registration.update())
        .catch((err) => console.error('Service worker non enregistré', err));
    }
  })
  .catch((err) => console.error(err));
