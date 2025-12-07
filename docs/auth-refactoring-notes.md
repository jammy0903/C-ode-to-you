# Google OAuth 로그인 리팩토링 노트

## 개요
2025-12-07 Google OAuth 로그인 로직 리팩토링 완료.
기존 authorization code 방식에서 ID Token 검증 방식으로 변경.

---

## 변경 전 (문제가 있던 방식)

### 흐름
```
Frontend                          Backend
   │                                 │
   ├─ Google OAuth ─────────────────►│
   │  { code: authorizationCode }    │
   │                                 ├─ Exchange code for access_token
   │                                 ├─ Fetch user info from Google API
   │                                 └─ Return JWT tokens
```

### 문제점
1. `accessToken`을 서버에서 Google API로 재검증하는 추가 네트워크 호출 필요
2. 토큰 유효성 검증이 약함
3. React Native + Expo 환경에서 authorization code flow가 복잡함

---

## 변경 후 (현재 방식 - 2024-2025 권장)

### 흐름
```
Frontend                          Backend
   │                                 │
   ├─ Google Sign-In ───────────────►│
   │  { idToken }                    │
   │                                 ├─ verifyIdToken() with google-auth-library
   │                                 │  (Google 공개키로 서명 검증)
   │                                 └─ Return JWT tokens
```

### 장점
1. `idToken`은 JWT 형식으로 Google 서명이 포함됨
2. `google-auth-library`의 `verifyIdToken()`으로 안전하게 검증
3. 추가 네트워크 호출 없이 토큰 자체에서 사용자 정보 추출 가능
4. Google이 공식 권장하는 방식

---

## 수정된 파일 목록

### Backend

| 파일 | 변경 내용 |
|------|----------|
| `src/modules/auth/auth.validation.ts` | `googleLoginSchema`: `code` → `idToken` 필드로 변경 |
| `src/modules/auth/auth.controller.ts` | `req.body.idToken` 추출, `googleLoginWithIdToken()` 호출 |
| `src/modules/auth/auth.service.ts` | `googleLoginWithIdToken()` 메서드 추가, `google-auth-library` 사용 |
| `src/app.ts` | `app.set('trust proxy', 1)` 추가 (ngrok 호환) |

### Frontend

| 파일 | 변경 내용 |
|------|----------|
| `src/shared/api/endpoints/auth.api.ts` | `{ idToken }` 전송으로 변경 |
| `src/features/auth/screens/LoginScreen.tsx` | `signInWithGoogle()`에서 `idToken` 추출 후 전달 |

---

## 핵심 코드

### Backend - auth.service.ts
```typescript
import { OAuth2Client } from 'google-auth-library';

private googleClient: OAuth2Client;

constructor() {
  this.googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
}

async googleLoginWithIdToken(idToken: string): Promise<AuthResponse> {
  // Google 공개키로 서명 검증
  const ticket = await this.googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  // payload.sub, payload.email, payload.name 사용
}
```

### Frontend - LoginScreen.tsx
```typescript
const handleGoogleLogin = async () => {
  const result = await signInWithGoogle();

  if (!result.idToken) {
    throw new Error('No idToken received from Google');
  }

  // idToken만 백엔드로 전송
  await loginWithGoogle(result.idToken);
};
```

---

## 디버깅 시 주의사항

### 1. Validation Schema 불일치 문제
**증상**: 요청이 백엔드에 도착하지만 컨트롤러 로그가 출력되지 않음

**원인**: `auth.validation.ts`의 스키마 필드명과 프론트엔드 요청 필드명 불일치

**해결**:
- `auth.validation.ts` 스키마 확인
- 프론트엔드 API 요청 body 확인
- 두 필드명이 정확히 일치해야 함

### 2. X-Forwarded-For 에러 (ngrok 사용 시)
**증상**: `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` 에러

**원인**: ngrok이 프록시 헤더를 추가하지만 Express가 이를 신뢰하지 않음

**해결**: `app.set('trust proxy', 1)` 추가

### 3. Google Client ID 설정
**필요한 설정**:
- `.env`: `GOOGLE_CLIENT_ID` (Web Client ID 사용)
- Google Cloud Console: OAuth 2.0 클라이언트 설정
- Android SHA-1 인증서 지문 등록

---

## 의존성

### Backend
```json
{
  "google-auth-library": "^9.x"
}
```

### Frontend
```json
{
  "@react-native-google-signin/google-signin": "^13.x"
}
```

---

## 테스트 체크리스트

- [x] Google 로그인 버튼 클릭 시 계정 선택 화면 표시
- [x] 계정 선택 후 idToken 획득
- [x] 백엔드로 idToken 전송
- [x] 백엔드에서 idToken 검증 성공
- [x] 사용자 DB 생성/업데이트
- [x] JWT 토큰 반환
- [x] 로그인 후 문제 목록 화면 이동

---

## 참고 자료

- [Google Sign-In for Android](https://developers.google.com/identity/sign-in/android)
- [Verify ID Tokens](https://developers.google.com/identity/sign-in/android/backend-auth)
- [@react-native-google-signin/google-signin](https://github.com/react-native-google-signin/google-signin)
- [google-auth-library (Node.js)](https://github.com/googleapis/google-auth-library-nodejs)
