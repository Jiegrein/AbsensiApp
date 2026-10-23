// Dynamic app config: everything static lives below; the backend host comes from the
// environment so no hostname is committed. EAS injects API_BASE_URL from the project's
// environment variables at build time; for `expo start` put it in a local .env file.
const apiBaseUrl = process.env.API_BASE_URL;
if (!apiBaseUrl) {
  throw new Error('API_BASE_URL is not set. Add it to .env (see .env.example) or to the EAS project environment variables.');
}

const config = {
  "name": "AbsensiApp",
  "slug": "AbsensiApp",
  "version": "1.2.0",
  "orientation": "portrait",
  "icon": "./assets/icon.png",
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#ffffff"
  },
  "updates": {
    "fallbackToCacheTimeout": 0
  },
  "assetBundlePatterns": [
    "**/*"
  ],
  "ios": {
    "supportsTablet": true
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#FFFFFF"
    },
    "permissions": [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO"
    ],
    "package": "com.jegrein.AbsensiApp",
    "versionCode": 3
  },
  "web": {
    "favicon": "./assets/favicon.png"
  },
  "plugins": [
    [
      "expo-camera",
      {
        "cameraPermission": "Aplikasi membutuhkan kamera untuk memindai QR proyek."
      }
    ],
    "expo-secure-store"
  ],
  "extra": {
    "eas": {
      "projectId": "abe43a18-2dd6-4c0e-a60f-faada911c5fb"
    }
  },
  "owner": "jiegrein"
};

config.extra.apiBaseUrl = apiBaseUrl;

export default { expo: config };
