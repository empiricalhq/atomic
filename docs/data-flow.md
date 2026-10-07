# Data flow

Data moves in one direction. A screen asks a hook, the hook asks a service,
the service asks storage, and the result comes back up the same path. This page
follows the transactions on the home screen.

```text
app/(tabs)/index.tsx
  └─ useTransactions()                      src/hooks/useTransactions.ts
       └─ TransactionsProvider              src/contexts/TransactionsContext.tsx
            └─ transactionService           src/api/transactionService.ts
                 └─ storageService          src/services/storageService.ts
                      └─ AsyncStorage  key "transactions"
```

## Reading

1. The home screen, [`app/(tabs)/index.tsx`](<../app/(tabs)/index.tsx>), calls
   `useTransactions()`, which returns the value of
   [`TransactionsProvider`](../src/contexts/TransactionsContext.tsx). The
   provider wraps every screen in [`app/_layout.tsx`](../app/_layout.tsx).
2. The provider reads the current user from `useUser()`. Its effect runs
   `loadTransactions()` whenever the user changes. With no user it sets an empty
   list.
3. `loadTransactions()` calls `transactionService.getUserTransactions(userId)`.
4. The service calls `storageService.getTransactions(userId)`, which parses the
   `transactions` key, keeps the records whose `userId` matches and converts
   each `date` to a `Date`.
5. The service sorts them newest first and returns them.
6. The provider stores the list, clears `loading` and the screen re-renders. The
   screen passes `getSummary()` totals to its cards and the first three
   transactions to `TransactionListItem`.

`getSummary()` calls `transactionService.getTransactionSummary`: total income,
total expenses, net amount, transaction count and the five categories with the
most spending. All sums go through
[`src/utils/money.ts`](../src/utils/money.ts).

Only the first load for a user shows `loading`. Later loads keep the list on
screen. Each load takes a sequence number. If `refreshTransactions` runs while
an earlier load is in flight, only the latest result is applied.

## Writing

[`app/add-expense.tsx`](../app/add-expense.tsx) calls
`addTransaction(data)` from `useTransactions`:

1. The provider adds the current user's id and calls
   `transactionService.createTransaction`.
2. The service gives the record a random id and calls
   `storageService.saveTransaction`.
3. `saveTransaction` appends the record to the `transactions` array under a
   per-key queue, so concurrent saves each keep their record.
4. The provider prepends the new record to the shared list and returns it. If a
   load is in flight, the provider starts another so that a read made before
   the write does not replace the list without the new record.

Every screen reads the same list, so the home and reports screens show the new
transaction without a reload. Pull-to-refresh on the home screen loads the list
again.

## Reports

[`useReports`](../src/hooks/useReports.ts) derives the reports screen from the
shared list. It keeps the transactions of the current month and the five months
before it ([`src/utils/reports.ts`](../src/utils/reports.ts)), and builds
income and expense totals for each of those months, the summary and the top
categories. It recomputes the window each time the reports tab gains focus,
because the month can change while the app stays open.

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
JSON stores dates as strings. `storageService` converts `User.createdAt` and
`Transaction.date` to `Date` when it reads them.
