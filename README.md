# atomic

[![CodeQL](https://github.com/empiricalhq/atomic/actions/workflows/codeql.yml/badge.svg)](https://github.com/empiricalhq/atomic/actions/workflows/codeql.yml)

atomic is a personal finance app for iOS and Android. It records income and
expenses, tracks monthly budgets per category, and keeps everything on the
device. It is built with React Native, Expo Router and NativeWind. The interface
is in Spanish.

## Get started

```bash
git clone https://github.com/empiricalhq/atomic
cd atomic
mise install
npm install
npm start
```

`mise install` installs the Node.js version in `mise.toml`. `npm start` starts
the development server. Scan its QR code with Expo Go. Simulators, emulators
and preview builds are in [Running the app](docs/running.md).

The app opens on a three-step onboarding. Tapping **Comenzar** creates an
anonymous local user and lands on the home screen, which shows the balance and
recent transactions.

## Features

- **Transactions.** Add an expense or an income with an amount, a category and a
  description. The home screen shows income, expense and net totals and the
  three newest transactions.
- **Budgets.** Set a monthly budget for an expense category. The budget screen
  shows spent against budgeted for the current calendar month, per category and
  in total.
- **Reports.** Income against expenses for each of the last six months, and the
  top five spending categories, from your transactions.
- **Settings.** Toggles for notifications, biometric login and dark mode are
  saved with the user. The screen shows an error if a change is not saved.
- **Local storage.** The user, transactions and budgets are stored in
  AsyncStorage on the device. There is no server and no account.
- **Exact money arithmetic.** Totals are summed in integer cents, so
  `0.1 + 0.2` is `0.3`.

## Documentation

The [manual](docs/README.md) covers running the app, the architecture, the data
flow, the user lifecycle and testing.

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## License

[Apache License 2.0](LICENSE).
