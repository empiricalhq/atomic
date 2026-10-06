# Testing and checks

CI runs three checks on every pull request
([`ci.yml`](../.github/workflows/ci.yml)). Run them locally in the same order:

```bash
npx tsc --noEmit
npm run lint
npm test
```

## Tests

`npm test` runs `vitest run`. It finds every `*.test.ts` and `*.test.tsx`.

```text
 Test Files  17 passed (17)
      Tests  67 passed (67)
```

One file or one directory:

```bash
npx vitest run src/utils
npx vitest run src/hooks/useTransactions.test.tsx
```

Layout:

- Tests sit beside the file they cover: `src/utils/money.test.ts`,
  `src/api/budgetService.test.ts`, `src/hooks/useBudget.test.tsx`.
- Screen tests live in [`tests/screens/`](../tests/screens).
- A test that renders React starts with `// @vitest-environment jsdom`. The
  default environment is Node.
- Tests that render screens or navigators replace `react-native` with plain DOM
  elements. Tests that touch storage replace
  `@react-native-async-storage/async-storage` with an in-memory `Map`, and
  `expo-crypto` with a counter, because its native module does not load under
  jsdom.
- `@/` resolves to `src/` in tests, as in the app
  ([`vitest.config.mts`](../vitest.config.mts)).

## Lint and format

`npm run lint` runs `oxlint` and then `oxfmt --check`. It exits non-zero on a
lint error or an unformatted file, including Markdown. Lint warnings print but
do not fail it.

```bash
npm run lint      # check
npm run format    # oxlint --fix, then oxfmt
```

Rules are in [`.oxlintrc.json`](../.oxlintrc.json) and formatting options are in
[`.oxfmtrc.json`](../.oxfmtrc.json).

## Type check

`npx tsc --noEmit` checks the whole project with `strict` on
([`tsconfig.json`](../tsconfig.json)).
