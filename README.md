# [app]: atomic

**atomic** is an app that brings all your personal finance tools together in one
place. It's built using React Native with TypeScript and styled using Tailwind
CSS through
[NativeWind v4](https://www.nativewind.dev/docs/getting-started/installation).
We use [Expo](https://expo.dev/) to make development and deployment faster and
easier for Android and iOS.

## Getting started

Development requires:

- [Node.js](https://nodejs.org/) and access to a physical iOS or Android device
  for testing. Our team uses [mise](https://mise.jdx.dev/getting-started.html)
  for tool management, which automatically handles version consistency across
  development environments.
- You'll also need [git](https://git-scm.com/) for version control, and
- the [Expo Go](https://expo.dev/client) mobile application installed on your
  testing device.

Begin by cloning the repository and navigating to the project directory:

```bash
git clone https://github.com/empiricalhq/atomic
cd atomic
```

If you're using mise for dependency management, install all required tools and
dependencies automatically:

```bash
mise install
```

Otherwise, install dependencies manually using npm:

```bash
npm install
```

Start the Metro bundler and development server with cache clearing to ensure a
clean build:

```bash
npx expo start --clear
```

The terminal will display a QR code that you can scan using the Expo Go app on
your physical device. The application will compile and deploy to your device,
presenting the welcome screen once the build process completes.

<!-- prettier-ignore -->
> [!TIP]
> Note that Expo Go provides hot reloading capabilities, allowing you to
> see changes immediately as you modify the codebase. You can force this
> pressing 'r' in the terminal.

## Architecture overview

We follow these core architectural principles:

1. Screen components maintain minimal responsibility, focusing solely on layout
   orchestration and data flow coordination while delegating all business logic
   and state management to custom hooks located in [`src/hooks`](src/hooks).
   This separation ensures that presentation logic remains decoupled from domain
   logic, facilitating testing and code reuse.
2. Static configuration data lives outside the main application code in
   dedicated modules found in [`src/constants`](src/constants), creating a
   single source of truth for application-wide settings and reducing the
   likelihood of inconsistencies across features.
3. The application implements a four-layer architecture that cleanly separates
   concerns.
   - The UI layer, encompassing the [`app`](app) directory and
     [`src/components`](src/components), focuses exclusively on rendering user
     interfaces and handling user interactions.
   - The logic layer, implemented through custom hooks in
     [`src/hooks`](src/hooks), manages application state and coordinates data
     flow between the UI and data layers.
   - The data layer, found in [`src/api`](src/api), abstracts data sources and
     contains business logic related to data entities, providing a consistent
     interface regardless of the underlying storage mechanism.
   - Finally, the infrastructure layer in [`src/services`](src/services) handles
     low-level operations such as file storage and device capabilities.

### Directory structure and organization

The project's directory structure reflects the layered architecture while
promoting feature colocation and code discoverability. Each directory serves a
specific purpose within the overall system design.

| Directory         | Purpose                                                                                             | Key Files / Examples                                                                                                                                                       | Implementation notes                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `app/`            | Entry point for **Expo Router**. File structure maps directly to navigation routes.                 | - `_layout.tsx`: Defines layout (Stack/Tabs).<br>- `(tabs)/`: Route group with shared layout.                                                                              | Only responsible for **routing & screen composition**. Screens should import hooks (logic) & components (UI). |
| `src/`            | Primary container for all source code. Keeps project root clean.                                    | —                                                                                                                                                                          | All feature code lives here.                                                                                  |
| `src/api/`        | Abstraction layer for **data fetching & business logic**. Defines _what_ data is needed, not _how_. | - `transactionService.ts`: Has `getTransactionSummary()`. Uses `storageService`.                                                                                           | Future home for REST/GraphQL calls.                                                                           |
| `src/components/` | All reusable React components.                                                                      | - `common/`: Generic (e.g., `Button`, `Card`).<br>- `layout/`: Structure (`Screen`, `Header`).<br>- `[feature]/`: Feature-specific (e.g., `budget/BudgetSummaryCard.tsx`). | Promotes **colocation** of feature-specific UI.                                                               |
| `src/constants/`  | Single source of truth for static, non-component data.                                              | - `categories.ts`<br>- `settings.ts`<br>- `theme.ts`                                                                                                                       | Used across app for consistency.                                                                              |
| `src/hooks/`      | Core of app logic. Encapsulates **state, side effects, and domain logic**.                          | - `useTransactions`: Manages array, loading/error state, exposes `addTransaction`, `refreshTransactions`.                                                                  | Components stay unaware of data source.                                                                       |
| `src/services/`   | Low-level **infrastructure services**. Focused on _how_, not _what_.                                | - `storageService.ts`: Wraps `AsyncStorage` with promise API.                                                                                                              | No business domain knowledge.                                                                                 |
| `src/types/`      | Centralized **TypeScript definitions**.                                                             | —                                                                                                                                                                          | Keeps typing consistent across app.                                                                           |
| `src/utils/`      | Pure, reusable helper functions.                                                                    | - `cn` (class merging)<br>- `formatters` (currency/date).                                                                                                                  | Framework-agnostic.                                                                                           |

The [`app`](app) directory leverages Expo Router's file-based routing system,
where the directory structure directly maps to navigation routes. The
[`_layout.tsx`](app/_layout.tsx) file defines the overall application layout,
while grouped routes in directories like [`(tabs)`](<app/(tabs)>) share common
layout components.

Component organization in [`src/components`](src/components) follows a
hierarchical structure that promotes reusability and feature colocation. Generic
components in [`common/`](src/components/common) provide building blocks used
throughout the application, while layout components in
[`layout/`](src/components/layout) handle structural elements. Feature-specific
components are grouped by domain, such as
[`budget/BudgetSummaryCard.tsx`](src/components/budget/BudgetSummaryCard.tsx),
making related UI elements easy to locate and maintain.

### Data flow architecture

The application implements a unidirectional data flow that maintains predictable
state management.

Consider the typical flow for displaying transaction data on the home screen.
When [`app/(tabs)/index.tsx`](<app/(tabs)/index.tsx>) (the HomeScreen component)
mounts, it immediately calls the `useTransactions()` hook to access transaction
data. The hook's internal `useEffect` triggers the `loadTransactions()`
function, which initiates the data retrieval process.

The `loadTransactions()` function calls
`transactionService.getUserTransactions(userId)` from the data layer,
abstracting the specific storage mechanism from the UI logic. The transaction
service then delegates to `storageService.getTransactions(userId)` in the
infrastructure layer, which handles the actual data retrieval from
`AsyncStorage`. This abstraction allows the service layer to sort and format
data according to business rules without the UI needing knowledge of storage
specifics.

As data returns up the call stack, each layer adds appropriate transformations.
The storage service returns raw data, the transaction service applies business
logic like sorting and filtering, and the hook manages loading states and error
handling. Finally, the HomeScreen re-renders with updated transaction data,
passing it to child components like `TransactionListItem` for display.

This architecture ensures that changing the underlying storage mechanism (from
AsyncStorage to a REST API, for example) requires modifications only in the
service layer, leaving hooks and UI components unchanged.

### State management strategy

The current implementation uses different patterns depending on the scope and
complexity of the state being managed.

Component-level state uses React's built-in `useState` hook for data that
doesn't need to be shared across components, such as modal visibility, form
input values, or temporary UI states. This approach keeps state close to where
it's used and avoids unnecessary complexity for simple interactions.

Domain-specific state management occurs through custom hooks like
`useTransactions` and `useBudget`, located in [`src/hooks`](src/hooks). These
hooks encapsulate both state and the logic that modifies it, providing a clean
interface for components while maintaining separation of concerns. This pattern
works well for the current application size and provides a clear upgrade path as
complexity increases.

Currently, the project doesn't implement global state management, relying
instead on prop passing and isolated hooks. This approach suffices for the
current feature set.

## Technical debt and future considerations

| Area                    | Current limitation                                                                    | Potential direction                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Global state management | Prop passing and isolated hooks become cumbersome when sharing state between features | Consider Zustand for its simplicity and hook-based API                                     |
| Authentication          | Anonymous users stored only on device, no account system or sync                      | Implement proper auth service when multi-device support is needed                          |
| Data persistence        | AsyncStorage is limited for queries and relations, some features use `mockData.ts`    | Replace mock data with real services, evaluate WatermelonDB or SQLite for complex querying |
| API layer               | Services talk directly to storage rather than network APIs                            | Refactor to network requests when backend integration is required                          |
| Form management         | Basic `useState` patterns don't scale well with validation needs                      | Consider React Hook Form for complex forms with validation                                 |
