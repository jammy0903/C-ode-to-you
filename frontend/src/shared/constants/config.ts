export const CONFIG = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  HEADERS: {
    COMMON: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  },
} as const;

export const OAUTH_CONFIG = {
  GOOGLE: {
    // Web Client ID - expo-auth-session에서 사용
    WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '681908599014-r6hdbp82iemnj3e7ogqj374mjd5l5nul.apps.googleusercontent.com',
    // Android Client ID - 네이티브 빌드에서 사용
    ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '681908599014-tm7leutsvkhtfr3fkacsq9io500svl4g.apps.googleusercontent.com',
    // Android Package: com.code2u.app
    // SHA-1 (Debug): 94:3B:59:00:63:C9:62:05:5E:CE:B1:1E:6A:DB:17:9B:80:7B:22:44
  },
  KAKAO: {
    APP_KEY: process.env.EXPO_PUBLIC_KAKAO_APP_KEY || '',
  },
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  THEME: 'theme',
} as const;

