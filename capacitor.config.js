/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'com.module14.app',
  appName: 'Module 14',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    Filesystem: {
      iosScheme: 'capacitor',
    },
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0f172a',
  },
};

module.exports = config;
