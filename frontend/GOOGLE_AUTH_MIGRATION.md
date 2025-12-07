# Google OAuth Migration Guide

## 변경 사항 요약

`expo-auth-session`에서 `@react-native-google-signin/google-signin`으로 마이그레이션했습니다.

### 이유
- `auth.expo.io` 프록시가 더 이상 안정적으로 작동하지 않음
- Expo 공식 문서에서 네이티브 Google Sign-In 라이브러리 권장
- 더 안정적이고 신뢰할 수 있는 인증 플로우

## 주요 변경점

### 1. 패키지 변경
```json
// 추가된 패키지
"@react-native-google-signin/google-signin": "^13.1.0"

// 제거 가능한 패키지 (현재는 유지 - Kakao OAuth에 사용 가능성)
// "expo-auth-session": "~7.0.9"
// "expo-web-browser": "~15.0.9"
```

### 2. app.json 설정
```json
{
  "expo": {
    "plugins": [
      "expo-secure-store",
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.681908599014-r6hdbp82iemnj3e7ogqj374mjd5l5nul"
        }
      ]
    ]
  }
}
```

### 3. useGoogleAuth Hook 변경
- `Google.useAuthRequest()` → `GoogleSignin.signIn()`
- `makeRedirectUri()` 불필요
- `WebBrowser.maybeCompleteAuthSession()` 불필요
- 네이티브 SDK 자동 초기화

## Dev Build 필수

⚠️ **중요**: 이 변경사항은 네이티브 모듈을 사용하므로 **Expo Go에서 작동하지 않습니다**.

### 로컬 Dev Build (Android)

```bash
# 1. 프리빌드 (네이티브 코드 생성)
npx expo prebuild --clean

# 2. Android 로컬 빌드
npx expo run:android
```

### EAS Build (권장)

```bash
# 1. EAS CLI 설치 (없는 경우)
npm install -g eas-cli

# 2. EAS 로그인
eas login

# 3. Dev Build 생성 (Android)
eas build --profile development --platform android

# 4. 빌드된 APK를 기기에 설치
# EAS 대시보드에서 다운로드 링크 확인
```

### eas.json 설정 (참고)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

## Google Cloud Console 설정

기존 OAuth 설정 유지:
- **Web Client ID**: `681908599014-r6hdbp82iemnj3e7ogqj374mjd5l5nul.apps.googleusercontent.com`
- **Android Client ID**: `681908599014-tm7leutsvkhtfr3fkacsq9io500svl4g.apps.googleusercontent.com`

### Redirect URI 변경
이전에는 `https://auth.expo.io/@fuso93/code2u`가 필요했지만,
네이티브 SDK는 **custom URL scheme을 직접 처리**하므로 별도의 redirect URI 설정이 불필요합니다.

## 테스트 방법

### 1. Dev Build 실행
```bash
# 로컬 빌드 후
npx expo start --dev-client

# 또는 EAS 빌드 APK 설치 후
npx expo start
```

### 2. Google 로그인 테스트
1. 로그인 화면에서 "Google로 시작하기" 버튼 클릭
2. Google 계정 선택
3. 권한 승인
4. 자동으로 앱으로 돌아와서 로그인 완료

### 3. 예상 로그
```
[GoogleAuth] SDK configured successfully
[GoogleAuth] Sign in successful: {
  email: "user@example.com",
  hasIdToken: true,
  hasAccessToken: true
}
```

## 트러블슈팅

### Q: "Google Play Services not available" 에러
**A**: Android 에뮬레이터에서 Google Play Services가 설치된 이미지를 사용해야 합니다.
- AVD Manager에서 "Play Store" 아이콘이 있는 이미지 선택

### Q: "Sign in is already in progress" 에러
**A**: 이전 로그인 시도가 완료되지 않았습니다. 앱을 재시작하거나 잠시 후 다시 시도하세요.

### Q: Expo Go에서 테스트하고 싶어요
**A**: 불가능합니다. 네이티브 모듈이므로 반드시 Dev Build가 필요합니다.

## 참고 자료
- [Stack Overflow: expo-auth-session 이슈](https://stackoverflow.com/questions/79809683/expo-google-oauth-makeredirecturi-returns-exp-instead-of-auth-expo-io-and-m/79810744#79810744)
- [@react-native-google-signin/google-signin 공식 문서](https://github.com/react-native-google-signin/google-signin)
- [Expo Dev Client 가이드](https://docs.expo.dev/development/introduction/)

## 마이그레이션 체크리스트

- [x] `@react-native-google-signin/google-signin` 설치
- [x] `app.json`에 플러그인 설정 추가
- [x] `useGoogleAuth` 훅 리팩토링
- [x] `LoginScreen` 호환성 확인
- [ ] Dev Build 생성 및 테스트
- [ ] 실제 기기에서 로그인 테스트
- [ ] 백엔드 토큰 검증 확인

## 다음 단계

1. **Dev Build 생성**: 위의 로컬 또는 EAS 빌드 방법 선택
2. **테스트**: 실제 기기 또는 에뮬레이터에서 Google 로그인 테스트
3. **검증**: 백엔드에서 idToken/accessToken 정상 수신 확인
4. **(선택) Kakao OAuth**: 필요시 expo-auth-session 유지 또는 네이티브 Kakao SDK 고려
