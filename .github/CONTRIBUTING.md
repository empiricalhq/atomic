# Contributing

Thank you for considering a contribution to atomic.

## The codebase

[Architecture](../docs/architecture.md) maps the code. Screens go in `app/`,
data loading in `src/hooks/`, rules over stored data in `src/api/`, and storage
access in `src/services/storageService.ts`. The architecture page also lists
the [boundaries](../docs/architecture.md#boundaries) a change must keep.

## Set up

Follow [Running the app](../docs/running.md) to install dependencies and start
the dev server.

## Make a change

1. Branch from `master`.
2. Add or update a test next to the file you change. See
   [Testing and checks](../docs/testing.md).
3. Run the checks CI runs:

   ```bash
   npx tsc --noEmit
   npm run lint
   npm test
   ```

   `npm run format` fixes lint and formatting problems it can.

4. Open a pull request against `master`. CI runs the same three commands.

## Conventions

- Interface text is Spanish. Code, comments and documentation are English.
- Import from `src/` with the `@/` alias.
- Style with NativeWind class names. Combine conditional classes with `cn` from
  [`src/utils/cn.ts`](../src/utils/cn.ts).
- Commit subjects read `area: what changed`, such as
  `hooks: reload transactions when the user changes`.
- Markdown is formatted by `oxfmt`, which `npm run lint` checks.
- Each fact lives in one document. Link to it instead of copying it.
