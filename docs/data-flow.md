# Data flow

Data moves in one direction. A screen asks a hook, the hook asks a service,
the service asks storage, and the result comes back up the same path. This page
follows the transactions on the home screen.

```text
app/(tabs)/index.tsx
  └─ useTransactions()                      src/hooks/useTransactions.ts
       └─ transactionService                src/api/transactionService.ts
            └─ storageService               src/services/storageService.ts
                 └─ AsyncStorage  key "transactions"
```

## Reading

1. The home screen, [`app/(tabs)/index.tsx`](<../app/(tabs)/index.tsx>), calls
   `useTransactions()`.
2. The hook reads the current user from `useUser()`. Its effect runs
   `loadTransactions()` whenever the user changes. With no user it sets an empty
   list.
3. `loadTransactions()` calls `transactionService.getUserTransactions(userId)`.
4. The service calls `storageService.getTransactions(userId)`, which parses the
   `transactions` key and keeps the records whose `userId` matches.
5. The service sorts them newest first and returns them.
6. The hook stores the list, clears `loading` and the screen re-renders. The
   screen passes `getSummary()` totals to its cards and the first three
   transactions to `TransactionListItem`.

`getSummary()` calls `transactionService.getTransactionSummary`: total income,
total expenses, net amount, transaction count and the five categories with the
most spending. All sums go through
[`src/utils/money.ts`](../src/utils/money.ts).

Each load takes a sequence number. If `refreshTransactions` runs while an
earlier load is in flight, only the latest result is applied.

## Writing

[`app/add-expense.tsx`](../app/add-expense.tsx) calls
`addTransaction(data)` from `useTransactions`:

1. The hook adds the current user's id and calls
   `transactionService.createTransaction`.
2. The service gives the record a random id and calls
   `storageService.saveTransaction`.
3. `saveTransaction` appends the record to the `transactions` array under a
   per-key queue, so concurrent saves each keep their record.
4. The hook prepends the new record to its own list and returns it.

`useTransactions` keeps a separate list in each screen that calls it. Saving
from `add-expense` updates that screen's list and storage. The home screen
loads its list again on pull-to-refresh and when the user changes.

## Budgets

[`useBudget`](../src/hooks/useBudget.ts) loads the user's budget categories and
transactions together and derives `spent` and `progress` for the current month
with [`src/utils/budget.ts`](../src/utils/budget.ts). It reloads every time the
budget tab gains focus. `addCategory` validates the amount and the category,
and `budgetService.addBudgetCategory` rejects a duplicate category for the same
user inside the storage queue.

## Stored shape

| Key                | Value                                      |
| ------------------ | ------------------------------------------ |
| `user`             | One `User`.                                |
| `transactions`     | Array of `Transaction`, for every user.    |
| `budgetCategories` | Array of `BudgetCategory`, for every user. |

The types are in [`src/types/index.ts`](../src/types/index.ts).
`storageService` does not revive dates: a `Date` field comes back from storage
as an ISO string, and readers wrap it in `new Date(...)`.
