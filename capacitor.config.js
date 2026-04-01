/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  // ── App Identity ──────────────────────────────────────────────────────────
  appId: 'com.eagle.lms',
  appName: 'Eagle LMS',

  // ── Build Output ─────────────────────────────────────────────────────────
  // Points to the Vite production build folder (npm run build → dist/)
  webDir: 'dist',

  server: {
    // Capacitor's internal WebView bridge uses https scheme.
    // Actual HTTP API calls to your FastAPI server are controlled by
    // android:usesCleartextTraffic in AndroidManifest.xml (already set).
    androidScheme: 'https',
  },

  plugins: {
    // Enable Capacitor's native HTTP plugin to bypass CORS on Android
    CapacitorHttp: {
      enabled: true,
    },
    Filesystem: {
      iosScheme: 'capacitor',
    },
  },

  android: {
    // Allow mixed HTTP/HTTPS content inside the WebView
    allowMixedContent: true,
    backgroundColor: '#0f172a',
  },
};

module.exports = config;
