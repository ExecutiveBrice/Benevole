# Outil de gestion de bénévoles
## Architecture :
* Backend : Spring / hibernate
* FrontEnd : Angular 9
* Packaging : Springboot2

## URL point d'entrée :
### Swagger
* http://<serveur>:<port>/benevoles/swagger-ui.html
* http://<serveur>:<port>/benevoles/v2/api-docs

### Utilisation
* http://<serveur>:<port>/benevoles/#/creation
* http://<serveur>:<port>/benevoles/#/gestionevenements

## Commandes utiles :
### Démarage de l'appli :
*L'application s'arrete de fonctionner après fermeture de la session*
>java -jar <file_location>\benevoles.jar --server.port=8091 --management.server.port=8191 --spring.config.location="file:///<file_location>\application.yml"

### Démarage de l'appli nohup :
*L'application continu de fonctionner après fermeture de la session*
>nohup java -jar <file_location>\benevoles.jar --server.port=8091 --management.server.port=8191 --spring.config.location="file:///<file_location>\application.yml" > /dev/null &


## Paramétrage de l'application
*via le fichier application.yml*
### log par défaut
* /var/java_gestion_benevole.log
* applicatif : Debug
* root/web/hibernate : Warning

### hibernate par défaut
* method: create-drop *création si absent*
* auto : update *remplissage si existant*

### super
java -jar D:\Ionic\GestionBenevole\serverPart\target\benevoles.jar --server.port=8091 --management.server.port=8191 --spring.config.location="file:///D:\Ionic\GestionBenevole\application.yml"
