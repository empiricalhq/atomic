# AGENTS.md

- Before finishing, run `npx tsc --noEmit`, `npm run lint` and `npm test`. All
  three must pass.
- Format Markdown and TypeScript with `oxfmt`. Do not use Prettier.
- Interface text is Spanish. Code, comments and documentation are English.
- Import from `src/` with `@/`.
- Only `src/services/storageService.ts` imports AsyncStorage.
- Screens in `app/` use hooks. They do not import `src/api` or `src/services`.
- Read and write the current user through `useUser()`.
- Sum and subtract money with `src/utils/money.ts`.
