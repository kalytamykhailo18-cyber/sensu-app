import dotenv from 'dotenv';

const cwd = process.cwd();
dotenv.config({path: `${cwd}/.env`, quiet: true});

export default {
  expo: {
    name: "Sensu",
    slug: "Sensu",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "sensu",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.estelasystems.sensu",
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.API_KEY_GMAPS,
      },
      statusBarStyle: "dark-content",
      statusBarBackgroundColor: "transparent",
    },
    android: {
      package: "com.sensu.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      googleServicesFile: "./google-services.json",
      config: {
        googleMaps: {
          apiKey: process.env.API_KEY_GMAPS,
        }
      }
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-notifications",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "La aplicación necesita acceso a tus fotos para cambiar tu foto de perfil.",
          cameraPermission: "La aplicación necesita acceso a la cámara para tomar fotos de perfil."
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      baseUrl: '/app',
    },
    extra: {
      API_KEY_GMAPS: process.env.API_KEY_GMAPS,
      WATCH_LOCATION_API: process.env.WATCH_LOCATION_API,
      WATCH_SERVER_URL: process.env.WATCH_SERVER_URL || 'https://api.sensu.com.mx',
      LOG_LEVEL: process.env.LOG_LEVEL || 'error',
      DEBUG_MODE: process.env.DEBUG_MODE || '0',
      eas: {
        projectId: "dcf88024-f0a6-4063-b874-cfa3982b50c2"
      }
    }
  }
};
