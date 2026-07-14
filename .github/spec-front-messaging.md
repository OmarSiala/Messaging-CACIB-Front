# spec-front-messaging.md

## Description du module
Ce module frontend Angular permet de piloter et superviser les messages de paiement autour du flux IBM MQ, via une interface unique composee de:
- publication d'un message vers la queue cible,
- consultation paginee des messages persistes,
- consultation detaillee d'un message par identifiant technique.

## Role dans l'architecture
- Interface IHM pour exploitation Back Office.
- Consommateur des APIs REST du backend messaging.
- Point de saisie pour initier un envoi de message vers MQ via backend.
- Ecran de supervision pour investigation rapide (liste + detail).

## User Story
En tant que Analyste Back Office, je veux publier et consulter les messages de paiement depuis l'IHM, afin de suivre les flux IBM MQ, verifier leur persistance et diagnostiquer les incidents rapidement.

## Regles de gestion Front
- RGF1: L'utilisateur peut saisir un payload et publier un message vers la queue cible DEV.QUEUE.1 via API backend.
- RGF2: La liste des messages est chargee automatiquement au chargement de la page.
- RGF3: La liste est paginee (page, taille) et rechargeable depuis le paginator.
- RGF4: La consultation d'un message par ID valide un format UUID avant appel API.
- RGF5: Le detail d'un message peut etre charge depuis la recherche par ID ou depuis une ligne de la liste.
- RGF6: Les erreurs API sont remontees avec un message utilisateur explicite.
- RGF7: Les actions clefs et erreurs techniques sont journalisees cote frontend.

## APIs backend consommees
- GET /api/v1/messages?page={page}&size={size}: lecture paginee des messages.
- GET /api/v1/messages/{id}: lecture detaillee d'un message.
- POST /api/v1/messages/publish: publication d'un message vers MQ.

Note: les 2 endpoints GET existent deja cote backend selon la specification partagee. L'endpoint POST /publish est la cible frontend retenue pour la fonctionnalite d'envoi.

## Configuration IBM MQ de reference (contextualisation)
- app.mq.queue-manager=QM1
- app.mq.channel=DEV.APP.SVRCONN
- app.mq.conn-name=localhost(1414)
- app.mq.username=app
- app.mq.password=passw0rd
- app.mq.inbound-queue=DEV.QUEUE.1

## Modele frontend
- Enum PaymentMessageStatus: RECEIVED, PROCESSED, FAILED, UNKNOWN.
- Interface PaymentMessageResponse:
  - id
  - mqMessageId
  - correlationId
  - sourceQueue
  - payload
  - status
  - receivedAt
  - createdAt
- Interface PageResponse<T> (structure Spring Page).
- Interface PublishMessageRequest (payload, sourceQueue, correlationId).

## Plan implementation execute
- Etape 1: Installation PrimeNG + PrimeIcons + animations Angular.
- Etape 2: Mise en place des modeles TypeScript et service API messaging.
- Etape 3: Creation d'un dashboard standalone Angular pour:
  - envoi message,
  - liste paginee,
  - detail par ID.
- Etape 4: Integration routing, providers HTTP, config PrimeNG.
- Etape 5: Ajout des tests unitaires service + composant + adaptation test racine.
- Etape 6: Validation test et build.

## Criteres d'acceptation (Gherkin)
- Etant donne un payload valide
  Quand l'utilisateur clique sur Envoyer vers MQ
  Alors l'IHM appelle POST /api/v1/messages/publish et affiche une notification de succes en cas de reponse positive.

- Etant donne des messages en base
  Quand l'utilisateur ouvre la page de supervision
  Alors l'IHM appelle GET /api/v1/messages?page=0&size=10 et affiche la liste.

- Etant donne une pagination disponible
  Quand l'utilisateur change de page
  Alors l'IHM recharge les messages de la page cible.

- Etant donne un identifiant UUID valide
  Quand l'utilisateur lance une recherche par ID
  Alors l'IHM appelle GET /api/v1/messages/{id} et affiche le detail du message.

- Etant donne un identifiant inexistant
  Quand l'API retourne 404
  Alors l'IHM affiche un message utilisateur clair d'absence de resultat.

## Tests implementes
- TU1: Verification creation du composant dashboard et chargement initial de la page 0.
- TU2: Verification de la recherche par ID et appel API detail.
- TU3: Verification du service API pour la lecture paginee.
- TU4: Verification de la propagation d'erreur lors de l'echec de publication.
- TU5: Verification du composant racine avec shell routeur.

## Resultats de validation
- npm run test -- --watch=false: OK, 3 fichiers de tests, 6 tests passes.
- npm run build: OK avec warning budget initial depasse (+22.10 kB), compilation terminee.

## Hypotheses et contraintes
- Le frontend ne publie pas directement sur MQ, il passe obligatoirement par l'API backend.
- L'endpoint POST /api/v1/messages/publish doit exister cote backend pour l'envoi.
- Le mode d'authentification est hors scope de cette implementation.
