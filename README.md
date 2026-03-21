# Trainiee App

Trainiee App is a React + Vite frontend with Capacitor Android support.

## Tech Stack

- React 19
- Vite 7
- React Router
- Capacitor 8 (Android)

## Project Structure

- `src/` - React app source code
- `src/screens/` - Main app screens (Modules, Assessment, Results, Settings, Storage)
- `src/components/` - Reusable UI components
- `android/` - Native Android project generated and managed by Capacitor

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
