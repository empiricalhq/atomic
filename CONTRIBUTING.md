# Contributing

## Set up

Follow [Running the app](docs/running.md) to install dependencies and start the
dev server.

## Make a change

1. Branch from `master`.
2. Find where the code belongs in [ARCHITECTURE.md](ARCHITECTURE.md). Screens go
   in `app/`, data loading in `src/hooks/`, rules over stored data in
   `src/api/`, and storage access in `src/services/storageService.ts`.
3. Add or update a test next to the file you change. See
   [Testing and checks](docs/testing.md).
4. Run the checks CI runs:

   ```bash
   npx tsc --noEmit
   npm run lint
   npm test
   ```

   `npm run format` fixes lint and formatting problems it can.

5. Open a pull request against `master`. CI runs the same three commands.

## Conventions

- Interface text is Spanish. Code, comments and documentation are English.
- Import from `src/` with the `@/` alias.
- Style with NativeWind class names. Combine conditional classes with `cn` from
  [`src/utils/cn.ts`](src/utils/cn.ts).
- Sum and subtract money with
  [`src/utils/money.ts`](src/utils/money.ts), not with `+` and `-`.
- Commit subjects read `area: what changed`, such as
  `build: add react-dom as a direct dependency at the sdk pin`.
- Markdown is formatted by `oxfmt`, which `npm run lint` checks.

## Documentation

Each fact lives in one document. [ARCHITECTURE.md](ARCHITECTURE.md) holds the
code map and [docs/](docs/README.md) holds the manual. Link to a fact instead
of copying it.
