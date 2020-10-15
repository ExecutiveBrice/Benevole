# Ouche Dinier Responsive Web App

Front Angular 6
-Bénévole inscription
-Gestion des bénévoles
-REST API

Back ExpressJS
-sequelize pour la liaison BDD
-nodemailer pour l'envoi de mail

BDD Postgres (addon heroku)

DEV MOD
git remote add origin https://github.com/ExecutiveBrice/GestionBenevole.git
npm install //add dependencies
ng build //build the Angular APP in the Dist folder
node ./bin/www //run the full app (front and back)


PROD MOD
copy these files and folder from your DEV environment
/bin
/dist
/server
app.js
... (à completer)
do a "npm install compression"

node ./bin/www //Pour lancement ponctuel (lié à la connexion)
nohup node ./bin/www > output.log //Pour un lancement permanent (jusqu'au reboot)