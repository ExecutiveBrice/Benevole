import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    window.dispatchEvent(new Event('benevoles:startup-ready'));
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
        .register(new URL('sw.js', document.baseURI).href, { updateViaCache: 'none' })
        .then((registration) => registration.update())
        .catch((err) => console.error('Service worker non enregistré', err));
    }
  })
  .catch((err) => {
    console.error('Démarrage de l’application impossible', err);
    window.dispatchEvent(new Event('benevoles:startup-failed'));
  });
