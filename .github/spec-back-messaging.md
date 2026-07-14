# spec-bootstrap.md

## Description du module
Ce module initialise la plateforme de collecte des messages de paiement entrants depuis IBM MQ, avec persistance transactionnelle en base PostgreSQL et consultation via API REST.

## Role dans l'architecture
- Point d'entree des messages asynchrones depuis IBM MQ.
- Couche de persistance relationnelle robuste pour historiser les messages.
- Couche d'exposition REST pour la consultation IHM / supervision.
- Base technique pour evolutions de routage et replay.

## User Story
En tant que **Analyste Back Office**, je veux **consulter les messages de paiement recus sur IBM MQ et stockes en base**, afin de **suivre les flux et investiguer rapidement les incidents**.

## Regles de gestion
- RG1: Chaque message disponible sur la file MQ doit etre lu sans attente manuelle.
- RG2: Un message recu doit etre persiste avant toute consultation.
- RG3: Chaque message conserve son identifiant MQ et son correlation ID.
- RG4: Les messages doivent etre consultables en liste paginee.
- RG5: Le detail d'un message doit etre consultable par identifiant technique.
- RG6: L'absence d'un message recherche doit etre signalee clairement.
- RG7: Le schema de donnees doit etre versionne et tracable.

## Endpoints REST exposes
- `GET /api/v1/messages` : consultation paginee des messages.
- `GET /api/v1/messages/{id}` : consultation detaillee d'un message.

## Modele de donnees
Entite principale : `payment_messages`
- `id` (UUID, PK)
- `mq_message_id` (VARCHAR64)
- `correlation_id` (VARCHAR64, nullable)
- `source_queue` (VARCHAR128)
- `payload` (TEXT)
- `status` (VARCHAR32)
- `received_at` (timestamp with time zone)
- `created_at` (timestamp with time zone)

## Criteres d'acceptation (Gherkin)
- Etant donne un message disponible sur IBM MQ
  Quand le listener le recoit
  Alors le message est persiste avec statut RECEIVED.

- Etant donne des messages en base
  Quand un client appelle GET /api/v1/messages
  Alors une page de messages est retournee avec code 200.

- Etant donne un identifiant inexistant
  Quand un client appelle GET /api/v1/messages/{id}
  Alors le service retourne un code 404.

- Etant donne une charge elevee de messages
  Quand les listeners tournent en concurrence
  Alors aucun message ne doit etre perdu.

- Etant donne une indisponibilite temporaire MQ
  Quand la connexion est retablie
  Alors la consommation doit reprendre automatiquement.

## Tests fonctionnels
- TF1: Injecter un TextMessage MQ valide et verifier la persistance complete.
- TF2: Appeler l'API liste et verifier la pagination et la structure JSON.
- TF3: Appeler l'API detail avec un ID inexistant et verifier la reponse 404.
- TF4: Simuler un message JMS non supporte et verifier le rejet technique.
- TF5: Verifier l'execution Liquibase au demarrage avec schema valide.

## Plan high-level
- Etape 1: Configurer Maven, Java 21, Spring Boot, PostgreSQL, Liquibase, IBM MQ JMS.
- Etape 2: Mettre en place les couches `controller`, `service`, `repository`, `mq`, `mapper`, `factory`.
- Etape 3: Modeliser les entites et scripts de migration Liquibase.
- Etape 4: Exposer les endpoints REST de consultation.
- Etape 5: Ajouter les tests unitaires/services/repository/controller/MQ.
- Etape 6: Valider les scenarios de base et preparer l'integration environnement banque.

## Hypotheses et contraintes
- Les identifiants de connexion MQ et PostgreSQL sont fournis via variables d'environnement ou vault.
- Les files MQ existent deja cote plateforme.
- L'authentification/autorisation API est hors scope de ce module.

## Flux MQ concernes
- Flux entrant principal: `app.mq.inbound-queue` (ex: `DEV.QUEUE.1`).

