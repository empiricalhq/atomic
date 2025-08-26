# [app]: atomic

[![CodeQL](https://github.com/empiricalhq/atomic/actions/workflows/codeql.yml/badge.svg)](https://github.com/empiricalhq/atomic/actions/workflows/codeql.yml)

**atomic** is a personal finance app that puts everything about your money in
one place. Instead of switching between multiple apps, users can track spending,
set goals, and manage their finances through a single, simple interface.

The app was built with React Native and TypeScript, styled with Tailwind CSS via
[NativeWind v4](https://www.nativewind.dev/docs/getting-started/installation),
and is powered by [Expo](https://expo.dev/) for a smooth deployment on both iOS
and Android.

## Getting started

Development requires Node.js, access to a physical iOS or Android device, and
[git](https://git-scm.com/) for version control. Install the
[Expo Go](https://expo.dev/client) app on your testing device.

Our team uses [mise](https://mise.jdx.dev/getting-started.html) to keep Node.js
versions consistent. Follow their setup guide before continuing.

Clone the repository and enter to the project directory:

```bash
git clone https://github.com/empiricalhq/atomic
cd atomic
```

Install dependencies. If using mise, it handles all required tools
automatically:

```bash
mise install
```

For manual dependency management, use npm:

```bash
npm install
```

Start the development server with cache clearing:

```bash
npx expo start --clear
```

Scan the QR code displayed in your terminal using Expo Go. The app will compile
and deploy to your device. Expo Go provides hot reloading: press <kbd>r</kbd> in
the terminal to force refresh during development.

## Architecture principles

The app is structured into **four layers**, each with a clear responsibility to
keep data flow simple and predictable.

1. **UI** ([`app`](app), [`src/components`](src/components)): Renders the
   interface and handles user input. Components only receive data and callbacks
   from hooks. They must not contain business logic.
2. **Logic** ([`src/hooks`](src/hooks)): Manages state and data flow between UI
   and data layers. Custom hooks like
   [`useTransactions`](src/hooks/useTransactions.ts) and
   [`useBudget`](src/hooks/useBudget.ts) contain domain logic and expose simple
   APIs for components.
3. **Data** ([`src/api`](src/api)): Defines how the app talks to data sources.
   Services (e.g. `transactionService.ts`) specify what data is needed, but not
   how it's retrieved, making it easy to swap backends.
4. **Infrastructure** ([`src/services`](src/services)): Handles low-level
   operations such as file storage and device features. These services focus on
   implementation details and don't include domain logic.

Static configuration lives in [`src/constants`](src/constants) as a single
source of truth for application settings.

---

The directory structure reflects this:

| Directory         | Purpose                                       | Key files                                  | Notes                                                |
| ----------------- | --------------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| `app/`            | Expo Router entry point and navigation routes | `_layout.tsx`, `(tabs)/`                   | File structure maps to routes. Handles routing only. |
| `src/api/`        | Data abstraction and business logic           | `transactionService.ts`                    | Future home for REST/GraphQL integration.            |
| `src/components/` | Reusable React components                     | `common/`, `layout/`, feature directories  | Organized by reusability and feature domain.         |
| `src/constants/`  | Static configuration data                     | `categories.ts`, `settings.ts`, `theme.ts` | Single source of truth for app-wide constants.       |
| `src/hooks/`      | Application state and domain logic            | `useTransactions`, `useBudget`             | Core business logic encapsulation.                   |
| `src/services/`   | Infrastructure and low-level operations       | `storageService.ts`                        | Implementation details without domain knowledge.     |
| `src/types/`      | TypeScript definitions                        | Type definitions for data models           | Centralized typing for consistency.                  |
| `src/utils/`      | Pure helper functions                         | `cn`, `formatters`                         | Framework-agnostic utilities.                        |

The [`app`](app) directory uses Expo Router's file-based routing where directory
structure determines navigation paths. Route groups like
[`(tabs)`](<app/(tabs)>) share layouts defined in
[`_layout.tsx`](app/_layout.tsx).

Component organization in [`src/components`](src/components) follows a hierarchy
that balances reusability with feature cohesion. Generic components in
[`common/`](src/components/common) provide building blocks, while
[`layout/`](src/components/layout) contains structural elements.
Feature-specific components group by domain, such as
[`budget/BudgetSummaryCard.tsx`](src/components/budget/BudgetSummaryCard.tsx).

## Data flow

The application implements unidirectional data flow for predictable state
management. Consider how transaction data appears on the home screen:

When [`app/(tabs)/index.tsx`](<app/(tabs)/index.tsx>) mounts, it calls the
`useTransactions()` hook to access transaction data. The hook's `useEffect`
triggers `loadTransactions()`, initiating data retrieval.

The `loadTransactions()` function calls
`transactionService.getUserTransactions(userId)` from the data layer. This
abstracts storage mechanisms from UI logic. The transaction service delegates to
`storageService.getTransactions(userId)` in the infrastructure layer, which
retrieves data from `AsyncStorage`.

Each layer adds appropriate transformations as data returns. The storage service
provides raw data, the transaction service applies business rules like sorting
and filtering, and the hook manages loading states and error handling. The
HomeScreen re-renders with updated data, passing it to components like
`TransactionListItem`.

This architecture isolates changes to specific layers. Switching from
AsyncStorage to a REST API requires modifications only in the service layer,
leaving hooks and components unchanged.

## State management

State management varies by scope and complexity. Component-level state uses
React's `useState` for data that doesn't cross component boundaries, including
modal visibility, form inputs, and temporary UI states. This keeps state close
to its usage without adding complexity.

Domain-specific state uses custom hooks like `useTransactions` and `useBudget`
in [`src/hooks`](src/hooks).

The project currently avoids global state management, relying on prop passing
and isolated hooks.
