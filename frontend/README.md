# C-ode to you - Frontend

React Native + Expo 기반 C언어 학습 모바일 앱

## Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **UI Library**: Tamagui (2025년 최신 트렌드)
- **State Management**: Zustand + Immer
- **Navigation**: React Navigation
- **API Client**: Axios
- **Font**: Orbit (코딩/게임 스타일 폰트)

## 프로젝트 구조

```
frontend/
├── src/
│   ├── app/              # 앱 진입점, 네비게이션, 프로바이더
│   ├── features/         # 기능별 모듈 (auth, problems, editor 등)
│   └── shared/           # 공통 리소스 (API, 컴포넌트, 훅, 타입 등)
├── assets/               # 이미지, 폰트 등 정적 리소스
├── package.json
├── tsconfig.json
├── app.json              # Expo 설정
├── tamagui.config.ts     # Tamagui 테마 설정
└── babel.config.js
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. Orbit 폰트 설정

Orbit 폰트를 사용하기 위해 다음 중 하나를 선택:

**방법 1: Google Fonts 사용 (권장)**
```bash
npm install @expo-google-fonts/orbitron
```

그리고 `src/shared/utils/fontLoader.ts`를 수정하여 Orbitron 폰트 사용

**방법 2: 커스텀 폰트 파일**
- `assets/fonts/` 폴더에 Orbit 폰트 파일 배치
- `fontLoader.ts`에서 require로 로드

자세한 내용은 `ORBIT_FONT_SETUP.md` 참고

### 3. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 API URL 등을 설정

### 4. 개발 서버 실행

```bash
npm start
```

또는

```bash
npm run android  # Android 에뮬레이터
npm run ios       # iOS 시뮬레이터
```

## 주요 기능

- ✅ 인증 (Kakao, Google OAuth)
- ✅ 문제 목록/상세 조회
- ✅ 코드 에디터 (자동 저장)
- ✅ 코드 제출 및 채점 결과 확인
- ✅ AI 힌트 및 코드 리뷰
- ✅ 사용자 통계 및 프로필

## 개발 가이드

### 컴포넌트 작성

```typescript
// features/problems/components/ProblemCard.tsx
import { YStack, Text } from 'tamagui';
import { globalStyles } from '@shared/styles/globalStyles';

export const ProblemCard = ({ problem }) => {
  return (
    <YStack style={globalStyles.card}>
      <Text style={globalStyles.heading3}>{problem.title}</Text>
    </YStack>
  );
};
```

### Hook 사용

```typescript
import { useProblems } from '@features/problems/hooks/useProblems';

const { problems, isLoading, loadMore } = useProblems();
```

### API 호출

```typescript
import { problemsApi } from '@shared/api/endpoints/problems.api';

const problem = await problemsApi.getProblemDetail('123');
```

## 스타일링

- **Tamagui**: 컴포넌트 스타일링
- **StyleSheet**: 전역 스타일 (`shared/styles/globalStyles.ts`)
- **Theme**: 색상, 간격 등 (`shared/styles/theme.ts`)

## 참고 문서

- [Tamagui Docs](https://tamagui.dev)
- [React Navigation](https://reactnavigation.org)
- [Expo Docs](https://docs.expo.dev)

