# Codebase Configuration Rules

## OAuth URL Configuration (ngrok)

### Current ngrok URL
```
https://bactericidal-euclid-unmotionable.ngrok-free.dev
```

**Important**: Free ngrok URLs change on restart. Update all configs when URL changes.

---

## Required File Updates

### 1. Backend Environment (`backend/.env`)

```bash
# OAuth Callbacks
KAKAO_CALLBACK_URL=https://bactericidal-euclid-unmotionable.ngrok-free.dev/api/auth/kakao/callback
GOOGLE_CALLBACK_URL=https://bactericidal-euclid-unmotionable.ngrok-free.dev/api/auth/google/callback
GITHUB_CALLBACK_URL=https://bactericidal-euclid-unmotionable.ngrok-free.dev/api/github/callback

# CORS (append ngrok URL to existing list)
CORS_ORIGIN=http://localhost:19006,http://localhost:3000,http://localhost:8081,https://bactericidal-euclid-unmotionable.ngrok-free.dev
```

**File Locations:**
- Line 17: `KAKAO_CALLBACK_URL`
- Line 22: `GOOGLE_CALLBACK_URL`
- Line 27: `GITHUB_CALLBACK_URL`
- Line 43: `CORS_ORIGIN`

### 2. Frontend Environment (`frontend/.env`)

Create file if not exists:

```bash
EXPO_PUBLIC_API_URL=https://bactericidal-euclid-unmotionable.ngrok-free.dev/api
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=681908599014-r6hdbp82iemnj3e7ogqj374mjd5l5nul.apps.googleusercontent.com
```

---

## OAuth Provider Settings

### Web OAuth (Backend)

Update redirect URIs in OAuth provider consoles:

- **Kakao Developer Console**: Add `https://bactericidal-euclid-unmotionable.ngrok-free.dev/api/auth/kakao/callback`
- **Google Cloud Console**: Add `https://bactericidal-euclid-unmotionable.ngrok-free.dev/api/auth/google/callback`
- **GitHub OAuth App**: Add `https://bactericidal-euclid-unmotionable.ngrok-free.dev/api/github/callback`

### Android OAuth (Native)

**Google Cloud Console** - Android OAuth Client Settings:

**IMPORTANT**: Ensure `android/app/debug.keystore` matches `~/.android/debug.keystore`

Required configuration:
- **Application Type**: Android
- **Package Name**: `com.code2u.app`
- **SHA-1 Certificate Fingerprint**: `94:3B:59:00:63:C9:62:05:5E:CE:B1:1E:6A:DB:17:9B:80:7B:22:44`

Location: https://console.cloud.google.com/apis/credentials

To verify and sync keystores:
```bash
# Check system keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1

# Check app keystore
keytool -list -v -keystore ./android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1

# If different, copy system keystore to app
cp ~/.android/debug.keystore ./android/app/debug.keystore
```

---

## Code References

These files read from environment variables (no code changes needed):

- `backend/src/modules/auth/auth.service.ts:130,154` - Reads callback URLs from env
- `backend/src/app.ts:22` - Reads CORS from env
- `frontend/src/shared/constants/config.ts:2` - Reads API URL from env
- `frontend/src/shared/api/client.ts:56` - Uses CONFIG.API_URL

---

## Quick Update Checklist

When ngrok URL changes:

- [ ] Update `backend/.env` (4 locations: Kakao, Google, GitHub callbacks + CORS)
- [ ] Update `frontend/.env` (API_URL)
- [ ] Update OAuth provider consoles (Kakao, Google, GitHub)
- [ ] Restart backend server
- [ ] Restart frontend app

---

## Android SDK Setup

**IMPORTANT**: Set `ANDROID_HOME` for `npx expo run:android` to work

Add to `~/.bashrc` (or `~/.zshrc` for zsh):
```bash
export ANDROID_HOME=$HOME/Android
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
```

Verify setup:
```bash
source ~/.bashrc  # or restart terminal
adb --version
echo $ANDROID_HOME
```

---

## Notes

- **Port**: Backend runs on 8080, proxied through ngrok
- **Google OAuth**: Current `.env` uses `https://auth.expo.io/@fuso93/code2u` (Expo Go). Update for web testing.
- **Frontend .env**: Create from `.env.example` if missing
- **Template files**: Optionally update `.env.example` files for documentation
