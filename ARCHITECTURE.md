# Architecture

atomic is a single Expo app. Screens are routes under [`app/`](app). They read
state from hooks, the hooks call services, and one service module talks to
AsyncStorage. The current user is the only shared state, held in a React
context.

```text
app/ screens ──► src/hooks ──► src/api ──► src/services/storageService.ts ──► AsyncStorage
     │               │
     │               └──► src/contexts/UserContext (current user)
     └──► src/components
```

[`App.tsx`](App.tsx) registers Expo Router's root component with `app/` as the
route context. [`app/_layout.tsx`](app/_layout.tsx) wraps the tree in
`SafeAreaProvider` and `UserProvider`, then renders
[`RootNavigator`](src/navigation/RootNavigator.tsx).

## Code map

| Path                                | Owns                                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [`app/`](app)                       | Routes. The file tree is the route tree. Screens compose components and hooks and hold local UI state.                 |
| [`app/(tabs)/`](<app/(tabs)>)       | The three tabs: `index` (home), `budget`, `reports`. `_layout.tsx` sets the tab bar.                                   |
| [`src/navigation/`](src/navigation) | `RootNavigator`: the stack and the guards that gate screens on the user state.                                         |
| [`src/contexts/`](src/contexts)     | `UserContext`: loads, creates and updates the current user.                                                            |
| [`src/hooks/`](src/hooks)           | `useUser`, `useTransactions`, `useBudget`: load data for the current user and expose it to screens.                    |
| [`src/api/`](src/api)               | Services with the rules over stored data: sorting and summaries, duplicate budgets, default settings, category lookup. |
| [`src/services/`](src/services)     | `storageService`: the only module that calls AsyncStorage.                                                             |
| [`src/components/`](src/components) | Presentational components, grouped by feature (`budget`, `transactions`, ...) plus `common`, `layout`, `navigation`.   |
| [`src/constants/`](src/constants)   | Expense and income categories, settings rows, theme values.                                                            |
| [`src/data/`](src/data)             | Sample data for the reports screen.                                                                                    |
| [`src/types/`](src/types)           | Shared TypeScript types: `User`, `Transaction`, `BudgetCategory`.                                                      |
| [`src/utils/`](src/utils)           | Pure helpers: money arithmetic, budget math, formatters, `cn`.                                                         |
| [`tests/screens/`](tests/screens)   | Screen-level tests. Other tests sit beside the file they cover.                                                        |

`@/` resolves to `src/` ([`tsconfig.json`](tsconfig.json)).

## Layers

**Screens and components** render and handle input. Screens in `app/` call
hooks. They do not import `src/api` or `src/services`. Components under
`src/components/` take props and callbacks, apart from
[`TransactionListItem`](src/components/transactions/TransactionListItem.tsx),
which looks up a category through `categoryService`.

**Hooks** hold the loading, error and list state for one feature.
[`useTransactions`](src/hooks/useTransactions.ts) and
[`useBudget`](src/hooks/useBudget.ts) read the current user from `useUser` and
reload when it changes. Each load carries a sequence number, so a slow earlier
load cannot overwrite a newer one.

**Services in `src/api/`** apply rules to stored data and return domain objects.
`transactionService` sorts newest first, assigns ids and builds the summary.
`budgetService` rejects a second budget for the same category.
`userService` creates the anonymous user with default settings and merges
settings and profile updates. `categoryService` finds a category by id or name.

**`storageService`** reads and writes the three AsyncStorage keys `user`,
`transactions` and `budgetCategories` as JSON, and filters records by user id.
Writes to a key run one at a time, and a read-modify-write (`updateUser`,
`addBudgetCategory`) runs inside that queue, so two concurrent updates do not
overwrite each other.

## State

| Scope                                          | Where                                                                        |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Form input, modal visibility                   | `useState` in the screen or component.                                       |
| Transactions, budgets                          | `useState` inside `useTransactions` and `useBudget`, one copy per hook call. |
| Current user (and its loading and error state) | `UserContext`, shared by every screen through `useUser`.                     |

Each screen that calls `useTransactions` loads its own copy of the list.
`useBudget` reloads on every focus of the budget tab.

## Boundaries

- Only `storageService` imports AsyncStorage.
- Only `UserProvider` holds the user. Screens read it through `useUser`, which
  throws outside a provider. See [docs/user.md](docs/user.md).
- Money is summed and subtracted through [`src/utils/money.ts`](src/utils/money.ts)
  in integer cents.
- `RootNavigator` is the only place that decides which screens a missing user
  can reach.

The request path for one screen is in [docs/data-flow.md](docs/data-flow.md).
