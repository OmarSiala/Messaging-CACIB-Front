# MessagingCacib

## Contexte

Application Angular dédiée à la gestion de messages de paiement. Le socle déjà implémenté couvre l'affichage, la consultation et la publication de messages, avec une UI construite en composants standalone.

### Ce qui est déjà en place

- 1 page principale de dashboard qui orchestre l'ensemble du parcours utilisateur.
- 3 composants métier: la liste des messages, le détail d'un message et le formulaire d'envoi.
- 1 couche service pour appeler le backend et gérer la récupération, le détail et la publication des messages.
- 1 couche modèle pour typer les données échangées avec l'API.
- PrimeNG pour les composants d'interface comme les tableaux, cartes, tags, pagination, toasts et formulaires.

### Découpage technique

- Couche présentation: composants standalone et formulaire réactif.
- Couche métier: dashboard qui coordonne la liste, le détail et l'envoi.
- Couche service: `PaymentMessageApiService` pour centraliser les appels HTTP.
- Couche données: interfaces et enum dans `core/models`.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
