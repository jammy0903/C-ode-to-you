# 프론트엔드 TODO 리스트

## ✅ 완료된 작업

### Phase 1: 기본 설정
- ✅ package.json (Tamagui, Expo, React Navigation 등)
- ✅ tsconfig.json (경로 별칭 포함)
- ✅ app.json (Expo 설정)
- ✅ babel.config.js (Tamagui 플러그인)
- ✅ .gitignore
- ✅ tamagui.config.ts (Orbitron 폰트 포함)

### Phase 2: 테마 & 스타일
- ✅ src/shared/styles/theme.ts (색상, 간격, 폰트)
- ✅ src/shared/styles/globalStyles.ts
- ✅ src/shared/utils/fontLoader.ts (Orbitron Google Fonts)

### Phase 3: 공통 컴포넌트
- ✅ ScreenContainer.tsx
- ✅ Button.tsx (variant, size, loading)
- ✅ Input.tsx (라벨, 에러, 아이콘)
- ✅ Loading.tsx
- ✅ ErrorBoundary.tsx

### Phase 4: 화면 컴포넌트 (기본)
- ✅ LoginScreen.tsx
- ✅ ProblemListScreen.tsx
- ✅ ProblemDetailScreen.tsx
- ✅ ProfileScreen.tsx (기본 구조)

### Phase 5: 기능별 컴포넌트 (기본)
- ✅ KakaoButton.tsx
- ✅ GoogleButton.tsx
- ✅ ProblemCard.tsx
- ✅ SearchBar.tsx
- ✅ ProblemFilter.tsx

### Phase 6: 네비게이션 구조
- ✅ RootNavigator.tsx
- ✅ AuthNavigator.tsx
- ✅ MainNavigator.tsx
- ✅ navigation.types.ts

### Phase 7: 프로바이더
- ✅ ThemeProvider.tsx
- ✅ AuthProvider.tsx

### Phase 8: API & State Management
- ✅ 모든 API 엔드포인트 (auth, problems, submissions, ai, users)
- ✅ 모든 Store (auth, problems, editor, submissions, chat, user)
- ✅ 모든 Hooks (useAuth, useProblems, useCodeEditor, useSubmission, useAIChat, useUserStats)

---

## 🔴 높은 우선순위 (핵심 기능)

### 1. 코드 에디터 화면 구현
- [ ] **CodeEditor.tsx** - 메인 코드 에디터 컴포넌트
  - WebView + CodeMirror 통합
  - 구문 강조 (C 언어)
  - 자동 완성
  - 라인 번호 표시
- [ ] **EditorToolbar.tsx** - 에디터 툴바
  - 실행 버튼
  - 제출 버튼
  - 포맷팅 버튼
  - AI 힌트 버튼
- [ ] **CodeMirrorWebView.tsx** - WebView 래퍼
  - CodeMirror 6 통합
  - 키보드 이벤트 처리
  - 코드 변경 감지

### 2. 제출 관련 화면 구현
- [ ] **SubmissionResultScreen.tsx** - 제출 결과 화면
  - 채점 상태 표시 (Pending → Judging → Accepted/Wrong)
  - 테스트 케이스 결과 리스트
  - 실행 시간/메모리 사용량
  - 에러 메시지 표시
- [ ] **HistoryScreen.tsx** - 제출 이력 화면
  - 제출 목록 (날짜순)
  - 필터링 (문제별, 상태별)
  - 상세 보기
- [ ] **SubmissionCard.tsx** - 제출 카드 컴포넌트
- [ ] **VerdictBadge.tsx** - 채점 결과 뱃지 (AC, WA, TLE 등)
- [ ] **TestCaseResult.tsx** - 테스트 케이스 결과 컴포넌트

### 3. 네비게이션 연결
- [ ] ProblemListScreen → ProblemDetailScreen 연결
- [ ] ProblemDetailScreen → CodeEditor 연결
- [ ] CodeEditor → SubmissionResultScreen 연결
- [ ] MainNavigator에 제출 이력 탭 추가
- [ ] 프로필에서 설정 화면 연결

### 4. OAuth 실제 연동
- [ ] Kakao OAuth SDK 설치 및 연동
  - `@react-native-seoul/kakao-login` 또는 `react-native-kakao-login`
  - 로그인 플로우 구현
- [ ] Google OAuth SDK 설치 및 연동
  - `@react-native-google-signin/google-signin`
  - 로그인 플로우 구현

---

## 🟡 중간 우선순위 (핵심 기능 확장)

### 5. AI 채팅 화면 구현
- [ ] **AIChatScreen.tsx** - AI 채팅 화면
  - 메시지 리스트
  - 입력 필드
  - 스크롤 처리
- [ ] **ChatBubble.tsx** - 채팅 말풍선
  - 사용자/AI 구분
  - 코드 블록 렌더링
  - 마크다운 지원
- [ ] **ChatInput.tsx** - 채팅 입력 필드
  - 멀티라인 입력
  - 전송 버튼
- [ ] **FloatingChatButton.tsx** - 플로팅 채팅 버튼
  - 문제 상세 화면에 표시
  - 애니메이션

### 6. 오답 노트 화면 구현
- [ ] **WrongAnswersScreen.tsx** - 오답 노트 화면
  - 오답 목록
  - 문제별 그룹화
  - 재시도 기능
- [ ] **WrongAnswerCard.tsx** - 오답 카드 컴포넌트
  - 문제 정보
  - 마지막 시도 날짜
  - 시도 횟수

### 7. 설정 화면 구현
- [ ] **SettingsScreen.tsx** - 설정 화면
  - 테마 변경 (다크/라이트)
  - 코드 폰트 크기 조절
  - 알림 설정
  - 로그아웃 버튼

### 8. 프로필 컴포넌트 구현
- [ ] **StatisticsCard.tsx** - 통계 카드
  - 해결한 문제 수
  - 제출 횟수
  - 정답률
  - 등급/티어
- [ ] **StreakCalendar.tsx** - 연속 학습 달력 (잔디)
  - GitHub 스타일 잔디
  - 날짜별 활동 표시
- [ ] **GitHubCard.tsx** - GitHub 연동 카드
  - 연동 상태
  - 연결/해제 버튼

---

## 🟢 낮은 우선순위 (개선 사항)

### 9. 기능별 컴포넌트 완성
- [ ] **FunctionRecommendations.tsx** - 추천 함수 컴포넌트
  - 문제별 추천 C 함수 표시
  - 함수 설명 링크
- [ ] **GitHubConnectButton.tsx** - GitHub 연결 버튼
- [ ] **CommitStatusBadge.tsx** - 커밋 상태 뱃지

### 10. 공통 훅 구현
- [ ] **useAsync.ts** - 비동기 작업 훅
- [ ] **useKeyboard.ts** - 키보드 이벤트 훅

### 11. 유틸리티 함수 구현
- [ ] **storage.ts** - AsyncStorage 래퍼
- [ ] **date.ts** - 날짜 포맷팅 유틸
- [ ] **validation.ts** - 입력 검증 유틸

### 12. 디자인 개선
- [ ] 로딩 애니메이션 개선
- [ ] 화면 전환 애니메이션
- [ ] 햅틱 피드백 추가
- [ ] 다크 모드 완전 지원
- [ ] 접근성 (Accessibility) 개선

### 13. 성능 최적화
- [ ] 이미지 최적화
- [ ] 리스트 가상화 (VirtualizedList)
- [ ] 메모이제이션 적용
- [ ] 번들 크기 최적화

### 14. 테스트
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] E2E 테스트 (선택)

---

## 📋 디자인 요소 체크리스트

### 색상 & 테마
- [x] 기본 색상 팔레트 정의
- [x] 다크/라이트 테마 지원
- [ ] 티어별 색상 (Bronze, Silver, Gold 등) 완전 적용
- [ ] 상태별 색상 (Solved, Attempted, Unsolved) 완전 적용

### 타이포그래피
- [x] Orbitron 폰트 적용
- [ ] 코드 에디터용 모노스페이스 폰트 설정
- [ ] 폰트 크기 반응형 조정

### 컴포넌트 스타일
- [x] 버튼 스타일 (Primary, Secondary, Outline, Ghost)
- [x] 입력 필드 스타일
- [ ] 카드 스타일 개선 (그림자, 호버 효과)
- [ ] 뱃지 스타일 (티어, 상태, 채점 결과)

### 레이아웃
- [x] ScreenContainer (SafeArea 지원)
- [ ] 반응형 레이아웃 (태블릿 지원)
- [ ] 키보드 처리 개선

### 아이콘
- [ ] Lucide Icons 통합 완료
- [ ] 커스텀 아이콘 추가 (필요시)

### 애니메이션
- [ ] 화면 전환 애니메이션
- [ ] 로딩 스피너 애니메이션
- [ ] 버튼 프레스 애니메이션
- [ ] 리스트 아이템 애니메이션

---

## 🚀 다음 스프린트 우선순위

### Sprint 1 (핵심 기능)
1. 코드 에디터 화면 구현 (CodeEditor, EditorToolbar)
2. 제출 결과 화면 구현 (SubmissionResultScreen)
3. 네비게이션 연결

### Sprint 2 (기능 확장)
4. AI 채팅 화면 구현
5. 오답 노트 화면 구현
6. 설정 화면 구현

### Sprint 3 (완성도 향상)
7. 프로필 컴포넌트 완성
8. 디자인 개선
9. 성능 최적화

---

**마지막 업데이트**: 2025-12-03
**진행률**: 약 40% 완료
