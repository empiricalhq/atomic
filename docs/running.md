# Running the app

## Requirements

- Node.js at the version pinned in [`mise.toml`](../mise.toml). With
  [mise](https://mise.jdx.dev/getting-started.html), `mise install` installs it.
- [Expo Go](https://expo.dev/client) on a phone, or an iOS simulator or Android
  emulator.

## Install and start

```bash
npm install
npm start
```

`npm start` runs `expo start` and prints a QR code. Scan it with Expo Go. Press
<kbd>r</kbd> in the terminal to reload the app.

To start with an empty Metro cache:

```bash
npx expo start --clear
```

## Other targets

| Command            | Runs                                                   |
| ------------------ | ------------------------------------------------------ |
| `npm run ios`      | `expo start --ios`                                     |
| `npm run android`  | `expo start --android`                                 |
| `npm run web`      | `expo start --web`                                     |
| `npm run prebuild` | `expo prebuild`, which generates `ios/` and `android/` |

`ios/` and `android/` are git-ignored.

## mise tasks

`mise tasks` lists them.

| Task                     | Runs                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `mise run setup`         | `npm install`, then `mise run dev`.                                                            |
| `mise run dev` (`d`)     | `npx expo start`.                                                                              |
| `mise run reset`         | `npm run format`, deletes `node_modules` and `.expo`, `npm install`, `npx expo install --fix`. |
| `mise run doctor`        | `npx expo-doctor` and `npx expo install --check`.                                              |
| `mise run build-preview` | `npx eas build -p android --profile preview`.                                                  |

`mise run dev` does not pass `--clear`.

## Preview builds

[`eas.json`](../eas.json) defines three EAS Build profiles: `development` (a
development client, internal distribution), `preview` (internal distribution)
and `production` (auto-incrementing version). Building needs an
[Expo](https://expo.dev) account with access to the project.

## Resetting local data

The app keeps its data in AsyncStorage on the device. Clear the app's storage,
or uninstall the app, to return to onboarding. See [The user](user.md).
