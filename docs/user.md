# The user

The app has one user per install, created locally on first launch. There is no
sign-in. [`UserProvider`](../src/contexts/UserContext.tsx) is the only holder
of that user. Screens read it with `useUser()`
([`src/hooks/useUser.ts`](../src/hooks/useUser.ts)), which throws when called
outside a provider.

## State

`useUser()` returns:

| Field         | Meaning                                                                    |
| ------------- | -------------------------------------------------------------------------- |
| `user`        | The stored `User`, or `null`.                                              |
| `loading`     | `true` while the stored user is being read.                                |
| `error`       | A message if the read failed, else `null`.                                 |
| `updateUser`  | Merges `settings` or `name` and `email` into the user and stores them.     |
| `refreshUser` | Reads the user again and resolves with it, or `null` on failure.           |
| `createUser`  | Creates and stores the anonymous user. Rejects unless the user is missing. |

A user is **missing** when loading has finished, there is no error and `user` is
`null`. An error is not the same as missing: a failed read must not lead to a
new user overwriting the stored one. `createUser` enforces this by rejecting
while loading, on error, or when a user exists.

On mount the provider calls `userService.loadUser()`. Calls to `refreshUser`
made while a load is in flight join it. `createUser` calls made while a create
is in flight share one promise, so a double tap creates one user.

## Navigation

[`RootNavigator`](../src/navigation/RootNavigator.tsx) chooses what to render:

| State   | Screen                                                   |
| ------- | -------------------------------------------------------- |
| loading | A spinner.                                               |
| error   | The message and a retry button that calls `refreshUser`. |
| missing | `onboarding` only.                                       |
| loaded  | `(tabs)`, `add-expense`, `scanner` and `config`.         |

The two groups use `Stack.Protected`, so a deep link cannot open a screen in the
other group.

[`app/onboarding.tsx`](../app/onboarding.tsx) calls `createUser()` from
**Comenzar** or **Saltar**, then replaces the route with `/(tabs)`.

## New user defaults

[`userService.createAnonymousUser`](../src/api/userService.ts) stores:

| Field         | Value                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `name`        | `Usuario`                                                                                         |
| `isAnonymous` | `true`                                                                                            |
| `settings`    | `notifications: true`, `biometric: false`, `darkMode: false`, `currency: 'USD'`, `language: 'es'` |

## Updating settings

`updateUser({ settings: { darkMode: true } })` is a patch. The storage layer
merges it into the record it reads inside the `user` key's queue, and the
provider merges it into its state, so two quick updates of different settings
both survive. The settings screen calls it from its three switches.
