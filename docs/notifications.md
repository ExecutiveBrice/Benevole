# Notifications de confirmation

Les confirmations automatiques des choix sont envoyées par Web Push aux appareils abonnés. Aucun email de confirmation ni email de secours n'est envoyé au bénévole. La case `copie` conserve l'envoi du récapitulatif par email à `contactEmail`, indépendamment des notifications.

## Configuration du serveur

Le seuil d'inactivité avant confirmation est configurable avec `APP_CONFIRMATION_DELAY_MINUTES` (en minutes, `5` par défaut), via l'environnement du backend ou le `.env` chargé par Docker Compose. Par exemple, `APP_CONFIRMATION_DELAY_MINUTES=1` réduit ce délai à une minute. Redémarrer le backend après modification. Le scheduler vérifie toujours les bénévoles chaque minute ; l'envoi peut donc intervenir jusqu'à une minute après le seuil configuré.

Depuis la racine du projet, générer une paire VAPID :

```sh
node scripts/generate-vapid.mjs
```

Copier les trois variables affichées dans le `.env` du serveur (chargé par `env_file` dans Docker Compose), et remplacer `APP_PUSH_SUBJECT` par l'adresse de contact réelle de l'organisateur. Ne pas versionner ces secrets. Garder la même paire de clés lors des redémarrages : les abonnements des navigateurs en dépendent.

Configurer `APP_FRONTEND_URL` avec l'adresse HTTPS publique de l'application. Le Docker Compose le fait déjà à partir de `DNS_NAME`. Le serveur doit pouvoir joindre en HTTPS les services Push Google, Mozilla et Apple. Le client utilise le service worker existant `/sw.js`.

Sans clés, l'application continue à fonctionner et affiche que les notifications ne sont pas disponibles ; aucun email de secours n'est envoyé. Une configuration partielle ou des clés invalides empêchent le démarrage avec une erreur explicite.

Hibernate `ddl-auto: update` crée les tables `notification_access`, `push_subscription` et `confirmation_delivery`. Les informations d'abonnement et condensats des accès ne sont pas exposés par les lectures publiques des bénévoles. La suppression d'un bénévole ou de son événement supprime ces données par cascade.

## Activer les notifications

Dans les paramètres de l'événement, cocher « Envoyer une notification de confirmation aux bénévoles ». Cette option fonctionne aussi avec la connexion simplifiée par prénom. Cocher séparément la confirmation par email de l'organisateur si souhaitée.

À l'ouverture de l'application (y compris sur la liste d'événements), un popup propose les notifications si cet appareil n'autorise pas encore l'application. L'autorisation est globale pour tous les événements de cette application, sur ce navigateur et cet appareil. Elle est vérifiée avec `Notification.permission` : l'absence d'une association serveur pour un événement ne déclenche aucune nouvelle demande d'autorisation. « Plus tard » ferme le popup sans demander la permission native. Après chaque inscription réussie à un créneau, le popup est proposé à nouveau si l'autorisation manque toujours ; un retrait ou une inscription échouée ne le déclenche pas. Une seule fenêtre est ouverte à la fois.

La demande native du navigateur est déclenchée par le clic sur « Autoriser les notifications ». Si les notifications sont déjà bloquées (`denied`), le popup explique comment les réautoriser dans les réglages du navigateur ; l'application ne peut pas forcer une nouvelle demande native. Le consentement peut être donné avant l'identification et reste conservé par le navigateur entre les ouvertures de l'application. Le même abonnement Push est réutilisé pour tous les événements. Les associations existantes ne sont pas réinscrites pour éviter de relancer inutilement les confirmations.

Une nouvelle inscription reçoit un accès personnel conservé sur l'appareil. Après identification ou inscription, cet accès associe automatiquement le bénévole à l'abonnement global, sans nouvelle permission. Les accès personnels déjà conservés pour les autres événements sont aussi synchronisés à l'ouverture de l'application ou après l'accord. L'autorisation globale du navigateur ne remplace pas cet accès personnel, nécessaire pour adresser uniquement les confirmations du bénévole concerné. Le bouton dans « Mes tâches » permet d'autoriser l'application ou de réessayer une association échouée.

Pour les bénévoles déjà inscrits, un nouvel appareil, une installation PWA distincte ou un accès expiré, l'organisateur utilise « Bénévoles » → fiche du bénévole → « Créer un lien personnel pour les notifications ». Le lien est copiable et affiché si le presse-papiers est indisponible. Le transmettre uniquement au bénévole concerné. Le secret est placé dans le fragment de l'URL, retiré de l'adresse à l'ouverture et échangé contre un accès d'appareil. Le lien est valable 7 jours et utilisable une seule fois ; l'accès de l'appareil est valable un an. Aucun email d'activation n'est envoyé par l'application.

Une simple adresse email saisie dans le formulaire ne délivre pas d'accès aux notifications d'un bénévole existant. Les invitations sont réservées aux administrateurs ayant accès à l'événement.

Sur iPhone/iPad (iOS/iPadOS 16.4 ou ultérieur), ajouter le site à l'écran d'accueil puis ouvrir l'application depuis son icône. HTTPS est requis hors localhost. Sans autorisation, les confirmations restent visibles dans l'application et aucun message externe n'est envoyé au bénévole.

Chaque appareil et navigateur possède sa propre autorisation globale. Quitter la page ne la retire pas : pour désactiver les notifications de toute l'application, modifier l'autorisation du site dans les réglages du navigateur. Une autre origine (par exemple localhost plutôt que le domaine de production) possède une autorisation distincte.

## Envoi et suivi

Le scheduler vérifie chaque minute les choix qui n'ont pas changé depuis au moins cinq minutes. Chaque ajout ou retrait effectif redémarre ce délai à partir du dernier mouvement, même si les modifications successives repoussent indéfiniment l'envoi. Après une confirmation, toute nouvelle modification déclenche une nouvelle confirmation après cinq minutes sans mouvement. Sans changement, aucune nouvelle notification n'est envoyée. Un retrait sans effet ou une inscription refusée ne redémarre pas le délai.

Une livraison persistante distingue chaque révision des choix, chaque appareil et la copie organisateur. Les états sont `PENDING`, `ACCEPTED`, `FAILED`, `EXPIRED` et `SKIPPED`. Les erreurs temporaires sont reprises après une puis cinq minutes, avec au maximum trois tentatives. Un appareil déjà accepté n'est pas renvoyé lors de la reprise d'un autre appareil ou de l'email organisateur. Les nouvelles modifications remplacent les anciennes confirmations encore en attente. Les ajouts et retraits utilisent le même verrou de bénévole que l'envoi pour éviter de perdre un changement pendant une confirmation.

Les réponses Push 404/410 suppriment l'abonnement expiré. Les erreurs permanentes arrêtent la livraison ; les erreurs finales sont consignées sans clés ni endpoints. Sans abonnement, la livraison est ignorée, sans email de secours. L'activation d'un nouvel appareil remet les choix courants à traiter pour cet appareil.

Le log précise désormais le canal (`push` ou `email-organisateur`), le vrai code HTTP et la cause. `HTTP 503 / HTTP_503` signifie une réponse temporaire du service Push ; un autre log indique le nom du fournisseur. `HTTP null / PUSH_EXCEPTION:…` indique une exception locale ou réseau (par exemple `HttpTimeoutException`, `SSLHandshakeException` ou `GeneralSecurityException`). `HTTP null / EMAIL_NOT_ACCEPTED` désigne l'échec de la copie organisateur : vérifier les logs Brevo et sa configuration. Aucune exception ni échec email n'est converti artificiellement en 503. Les erreurs réseau et HTTP temporaires restent limitées à trois tentatives ; les erreurs de préparation ou chiffrement sont arrêtées dès la première tentative.

En localhost, redémarrer le backend après les changements de code et conserver la paire VAPID existante. Recharger `http://localhost:4200/<id-evenement>`, accepter le popup et terminer l'identification. Modifier un choix puis attendre cinq à six minutes pour tester une nouvelle livraison. Une livraison déjà en état `FAILED` n'est pas relancée par le redémarrage : une nouvelle modification crée une nouvelle révision. En cas d'échec, relever la nouvelle ligne avec le canal et la cause, sans partager de clés ni endpoint d'abonnement.

`ACCEPTED` signifie que le service Push a accepté le message, pas que le téléphone l'a affiché ou que le bénévole l'a lu. Le drapeau historique `adviseSent` signifie désormais que le changement a fini d'être traité, y compris les livraisons ignorées ou définitivement échouées. Les transactions verrouillent le bénévole pendant l'envoi pour éviter deux workers concurrents. Comme tout envoi réseau, un arrêt du processus entre l'acceptation distante et la validation en base peut provoquer une répétition ; le `tag` de notification remplace la confirmation précédente dans le navigateur. Le worker utilise `renotify: true` pour demander une nouvelle alerte lors de ce remplacement, dans les navigateurs qui le prennent en charge et selon les réglages système.

La notification affiche uniquement la prise en compte des choix et le nom public de l'événement. Le clic ouvre une page de lecture affichant le titre, le texte intégral reçu et l'heure de réception, sans identification préalable. Le bouton « Ouvrir l’événement » permet ensuite d'accéder à l'événement, où le bénévole s'identifie pour consulter ses créneaux. Le message est transmis à la page dans le fragment de l'URL, qui n'est pas envoyé au serveur. La page de lecture est mise en cache pour rester accessible hors connexion après activation du nouveau service worker. Une page de lecture déjà ouverte est réutilisée sans remplacer la page de l'événement. Le lien personnel et les clés d'accès ne figurent jamais dans la notification.

## Diagnostiquer une notification invisible dans Chrome

Une réponse Push `201` confirme l'acceptation par le fournisseur, sans prouver que ce navigateur a reçu le message. `adviseSent = true` confirme la fin du traitement serveur. L'autorisation `Notification.permission === 'granted'` concerne le site ; les réglages de notifications du système et le mode « Ne pas déranger » peuvent encore masquer la bannière.

Quand l'envoi automatique déclenche le toast et `display-requested`, le parcours serveur → navigateur → `showNotification()` a fonctionné. La notification native est présentée par le système, en dehors de la page web. Sur Windows, vérifier **Paramètres → Système → Notifications → Google Chrome**, les bannières et le centre de notifications (`Win + N` sur Windows 11). Sur macOS, vérifier **Réglages Système → Notifications → Google Chrome**, l'autorisation et le style d'alerte, puis le mode Concentration. Le `410` d'un autre envoi n'explique pas l'absence de bannière pour le Push effectivement reçu.

Le service worker écrit des traces `[Bénévoles Push]` avec l'heure de réception et les étapes `received`, `display-requested` ou `display-failed`. `display-requested` indique que `showNotification()` a réussi, sans garantir une bannière visible ni une lecture. `display-failed` donne le nom de l'erreur de création. Ces traces ne contiennent ni contenu de notification, ni endpoint, ni clés. Elles sont aussi relayées à la console des onglets ouverts. À la réception, un message « Notification reçue » apparaît brièvement dans l'application ouverte ; ce message ne dépend pas de la bannière système et ne constitue pas un historique des notifications.

Après mise à jour du client, recharger la page pour activer le nouveau `/sw.js`. Dans les DevTools Chrome, garder le niveau **Info** activé dans **Console** et filtrer sur `Bénévoles Push`. Dans **Application → Service Workers**, utiliser **Push** avec ce JSON pour tester le worker sans attendre le scheduler ni contacter le serveur :

```json
{"title":"Test Bénévoles","body":"Test local de réception","url":"/","tag":"test-local"}
```

Pour tester uniquement la création d'une notification système, exécuter dans la console de la page :

```js
const registration = await navigator.serviceWorker.ready;
console.log('Autorisation :', Notification.permission);
await registration.showNotification('Test Bénévoles', {
  body: 'Test local d’affichage', tag: 'test-local'
});
console.log('Notifications actives :', (await registration.getNotifications()).map(n => ({ title: n.title, tag: n.tag })));
```

Ce test direct ne déclenche pas l'événement `push` ni le message dans l'application. Si la notification figure parmi les notifications actives sans bannière visible, vérifier les réglages système de Chrome, le centre de notifications et le mode « Ne pas déranger ». Si le test **Push** fonctionne mais qu'un véritable envoi `201` ne produit aucune trace `received`, vérifier que l'abonnement utilisé correspond au même navigateur, profil et origine que la page testée. **Application → Background services → Push messaging / Notifications → Record** permet aussi d'enregistrer les événements ; **Inspect** sur le service worker donne accès à sa console lorsque la page n'était pas ouverte.

Le log `Banner not shown: beforeinstallpromptevent.preventDefault() called…` concerne la proposition d'installation PWA. L'application intercepte cette proposition pour afficher sa fenêtre d'installation sur mobile puis appelle `prompt()` au clic sur « Installer ». Ce log ne signale pas un échec de réception Push.

### Renouveler un abonnement après HTTP 410

`HTTP 410` indique que l'abonnement ciblé n'est plus utilisable chez le fournisseur Push. Le backend marque cette livraison `EXPIRED` et supprime l'abonnement en base. Le client réutilise toutefois ce que `pushManager.getSubscription()` renvoie : si Chrome conserve encore l'ancien abonnement, un simple rechargement peut le réinscrire sans le renouveler.

Sur la page de l'application, dans le navigateur concerné et avec l'autorisation toujours accordée, exécuter ce renouvellement dans la console :

```js
const pushRegistration = await navigator.serviceWorker.ready;
const oldSubscription = await pushRegistration.pushManager.getSubscription();
if (oldSubscription && !await oldSubscription.unsubscribe()) {
  throw new Error('Impossible de retirer l’ancien abonnement.');
}
location.reload();
```

L'autorisation et les accès personnels dans le stockage local sont conservés. Au rechargement, la synchronisation des accès connus recrée l'abonnement et l'associe aux événements. Vérifier les réponses `204` à `POST /notifications/subscriptions`, puis modifier un choix et attendre cinq à six minutes pour un nouvel envoi automatique. Si l'accès personnel manque ou a expiré, utiliser un nouveau lien fourni par l'organisateur.

Un toast de réception ne prouve pas qu'un envoi rejeté avec `410` a été reçu : il peut provenir du bouton **Push** des DevTools, d'un autre envoi ou d'un autre abonnement. Pour le problème d'affichage, relever séparément `display-requested` ou `display-failed` et son erreur.

## Validation

```sh
cd app
mvn test
cd ../client
npm run build
npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/services/push-notification.service.spec.ts --include=src/app/services/auth.service.spec.ts '--include=src/app/components/notifications/*.spec.ts' --include=src/app/components/planning/planning.component.spec.ts
cd ..
node --test client/tests/service-worker.test.mjs
```

Après déploiement HTTPS, vérifier le popup dès l'ouverture de l'application, son retour après inscription si l'accord manque, l'absence de nouvelle demande lors du passage à un autre événement avec un accord déjà donné, l'activation sur Chrome/Android, Firefox et une application installée sur iPhone, l'envoi après cinq minutes, le clic vers l'événement, la désactivation dans le navigateur, et la copie organisateur avec et sans notifications. Les tests locaux utilisent des services d'envoi simulés et ne contactent aucun bénévole.
