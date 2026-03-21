# Trainee App

Trainee App is a React + Vite frontend with Capacitor Android support.

## Tech Stack

- **React 19** for UI rendering
- **Vite 7** for local development and production builds
- **React Router DOM 7** for in-app navigation patterns
- **Capacitor 8** for Android packaging and native plugin access
- Capacitor plugins used in-app:
  - `@capacitor/filesystem`
  - `@capacitor/preferences`
  - `@capacitor-community/http`
  - `capacitor-secure-storage-plugin`

## Project Structure

```text
Trainee-app/
├── src/
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # Top-level app + tab navigation state
│   ├── index.css                # Global styles
│   ├── mockData.js              # Mock module/assessment/result data
│   ├── nativeServices.js        # Wrapper around Capacitor/native APIs
│   ├── screens/                 # Screen-level UI
│   │   ├── ModulesScreen.jsx
│   │   ├── ModuleDetailScreen.jsx
│   │   ├── AssessmentDetailScreen.jsx
│   │   ├── ResultsScreen.jsx
│   │   ├── SettingsScreen.jsx
│   │   └── StorageManagerScreen.jsx
│   └── components/              # Reusable UI building blocks
│       ├── ModuleCard.jsx
│       ├── ResultCard.jsx
│       ├── DownloadQualitySelector.jsx
│       ├── StorageBar.jsx
│       ├── ConfirmDialog.jsx
│       ├── Toast.jsx
│       └── Icons.jsx
├── android/                     # Native Android project managed by Capacitor
├── capacitor.config.js          # Capacitor app + Android runtime config
├── vite.config.js               # Vite build/dev-server config
└── package.json                 # Scripts and dependencies
```

### How the code is organized

- **Entry + composition**: `src/main.jsx` mounts React and renders `App`.
- **App shell**: `src/App.jsx` coordinates major app sections and current-screen state.
- **Screens layer (`src/screens`)**: each file represents a full view in the app flow (module list/details, assessment details, results, settings, storage management).
- **Component layer (`src/components`)**: shared presentational components reused by screens.
- **Data/services**:
  - `src/mockData.js` provides local data structures for modules/assessments.
  - `src/nativeServices.js` isolates storage/network/native calls behind one module.

### Configuration files

- `vite.config.js`
  - React plugin enabled
  - Dev server on port `3000`
  - Relative base path (`./`) for compatibility with Capacitor/webview deployments
  - Build output directory: `dist/`
- `capacitor.config.js`
  - App identifier/name for native packaging
  - Android webview/server settings used when running on device

## Prerequisites

- Node.js 18+
- npm
- Android Studio (for Android builds)

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`).

## Build for Web

```bash
npm run build
npm run preview
```

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Create a production bundle in `dist/`
- `npm run preview` - Serve the built bundle locally

## Testing and linting status

- There is currently **no test framework** configured in `package.json`.
- There is currently **no linter script** configured in `package.json`.

## Android (Capacitor)

Sync web assets to Android:

```bash
npx cap sync android
```

Open Android Studio project:

```bash
npx cap open android
```

## Git

Recommended ignored items are already configured in `.gitignore`, including:

- `node_modules/`
- `dist/`
- `android/**/build/`
- `android/.gradle/`
- local environment files

## License

ISC
