# Frontend ↔ Backend Mapping

## Overview

This document maps **frontend modules/screens/hooks** to the **backend API endpoints** they consume, based on the current implementation under `backend/src` and the architecture plan for `frontend/src`.

Base API URL:
- Development: `http://localhost:3000/api`

---

## 1. Authentication (Auth)

### Related Use Cases
- UC-1.1: User Registration/Login
- UC-1.2: Logout

### Backend Endpoints
- `POST /api/auth/kakao` – Kakao OAuth login
- `POST /api/auth/google` – Google OAuth login
- `POST /api/auth/refresh` – Refresh access token
- `POST /api/auth/logout` – Logout user

### Frontend Modules
- `frontend/src/features/auth/screens/LoginScreen.tsx`
- `frontend/src/features/auth/components/KakaoButton.tsx`
- `frontend/src/features/auth/components/GoogleButton.tsx`
- `frontend/src/features/auth/hooks/useAuth.ts`
- `frontend/src/features/auth/store/authStore.ts`
- `frontend/src/shared/api/endpoints/auth.api.ts`

### Expected Mapping
- `auth.api.ts`
  - `loginWithKakao(code)` → `POST /api/auth/kakao`
  - `loginWithGoogle(code)` → `POST /api/auth/google`
  - `refreshToken(refreshToken)` → `POST /api/auth/refresh`
  - `logout()` → `POST /api/auth/logout`
- `useAuth.ts`
  - Wraps the above API calls
  - Manages auth state in `authStore.ts`
- `LoginScreen.tsx`
  - Uses `useAuth` and Kakao/Google buttons to start OAuth flow

---

## 2. Problems

### Related Use Cases
- UC-2.1: View Problem List
- UC-2.2: Search Problems
- UC-2.3: Filter Problems by Tag/Difficulty
- UC-3.1: View Problem Detail

### Backend Endpoints
- `GET /api/problems` – Get paginated problem list
- `GET /api/problems/search` – Search problems
- `GET /api/problems/stats` – Get problem statistics
- `GET /api/problems/:problemId` – Get problem detail
- `GET /api/problems/:problemId/functions` – Get recommended functions for a problem

### Frontend Modules
- `frontend/src/features/problems/screens/ProblemListScreen.tsx`
- `frontend/src/features/problems/screens/ProblemDetailScreen.tsx`
- `frontend/src/features/problems/components/ProblemCard.tsx`
- `frontend/src/features/problems/components/ProblemFilter.tsx`
- `frontend/src/features/problems/components/SearchBar.tsx`
- `frontend/src/features/problems/components/FunctionRecommendations.tsx`
- `frontend/src/features/problems/hooks/useProblems.ts`
- `frontend/src/features/problems/hooks/useProblemDetail.ts`
- `frontend/src/features/problems/store/problemStore.ts`
- `frontend/src/shared/api/endpoints/problems.api.ts`

### Expected Mapping
- `problems.api.ts`
  - `getProblems(params)` → `GET /api/problems`
  - `searchProblems(query)` → `GET /api/problems/search`
  - `getProblemStats()` → `GET /api/problems/stats`
  - `getProblemDetail(problemId)` → `GET /api/problems/:problemId`
  - `getRecommendedFunctions(problemId)` → `GET /api/problems/:problemId/functions`
- `useProblems.ts`
  - Fetch paginated list, search, filter
  - Expose loading/error/pagination state to `ProblemListScreen`
- `useProblemDetail.ts`
  - Fetch detail + recommended functions
  - Feed `ProblemDetailScreen` and `FunctionRecommendations` component

---

## 3. Submissions

### Related Use Cases
- UC-3.2: Submit Code for Problem
- UC-3.3: View Submission Result
- UC-3.4: View Submission History
- UC-3.5: Manage Draft Code
- UC-7.x: Wrong Answers Management

### Backend Endpoints
- `POST /api/submissions/:problemId/submit` – Submit code for judging
- `GET /api/submissions/:submissionId/status` – Get submission status/result
- `GET /api/submissions/:problemId/my-last` – Get user's last submission for a problem
- `GET /api/submissions/:problemId/attempts` – Get all user's attempts for a problem
- `POST /api/submissions/:problemId/draft` – Save draft code
- `GET /api/submissions/:problemId/draft` – Get draft code
- `GET /api/submissions/wrong` – Get user's wrong submissions list
- `GET /api/submissions/history` – Get user's submission history
- `POST /api/submissions/validate` – Quick validation (compile check)

### Frontend Modules
- `frontend/src/features/editor/components/CodeEditor.tsx`
- `frontend/src/features/editor/components/EditorToolbar.tsx`
- `frontend/src/features/editor/components/CodeMirrorWebView.tsx`
- `frontend/src/features/editor/hooks/useCodeEditor.ts`
- `frontend/src/features/editor/hooks/useAutoSave.ts`
- `frontend/src/features/editor/store/editorStore.ts`
- `frontend/src/features/submissions/screens/SubmissionResultScreen.tsx`
- `frontend/src/features/submissions/screens/HistoryScreen.tsx`
- `frontend/src/features/submissions/components/SubmissionCard.tsx`
- `frontend/src/features/submissions/components/TestCaseResult.tsx`
- `frontend/src/features/submissions/components/VerdictBadge.tsx`
- `frontend/src/features/submissions/hooks/useSubmission.ts`
- `frontend/src/features/submissions/hooks/useSubmissionStatus.ts`
- `frontend/src/features/submissions/store/submissionStore.ts`
- `frontend/src/features/wrong-answers/screens/WrongAnswersScreen.tsx`
- `frontend/src/features/wrong-answers/components/WrongAnswerCard.tsx`
- `frontend/src/features/wrong-answers/hooks/useWrongAnswers.ts`
- `frontend/src/shared/api/endpoints/submissions.api.ts`

### Expected Mapping
- `submissions.api.ts`
  - `submitCode(problemId, payload)` → `POST /api/submissions/:problemId/submit`
  - `getSubmissionStatus(submissionId)` → `GET /api/submissions/:submissionId/status`
  - `getMyLastSubmission(problemId)` → `GET /api/submissions/:problemId/my-last`
  - `getProblemAttempts(problemId)` → `GET /api/submissions/:problemId/attempts`
  - `saveDraft(problemId, payload)` → `POST /api/submissions/:problemId/draft`
  - `getDraft(problemId)` → `GET /api/submissions/:problemId/draft`
  - `getWrongSubmissions(params)` → `GET /api/submissions/wrong`
  - `getSubmissionHistory(params)` → `GET /api/submissions/history`
  - `validateCode(payload)` → `POST /api/submissions/validate`
- `useCodeEditor.ts`
  - Integrates with `saveDraft`, `getDraft`, and `validateCode`
- `useSubmission.ts`
  - Wraps `submitCode`, handles redirect to `SubmissionResultScreen`
- `useSubmissionStatus.ts`
  - Polls or fetches `getSubmissionStatus`
- `useWrongAnswers.ts`
  - Uses `getWrongSubmissions` and `getSubmissionHistory`

---

## 4. AI Assistance (AI Chat & Review)

### Related Use Cases
- UC-4.1: Request AI Hint While Solving
- UC-4.2: View AI Chat History
- UC-4.3: Request AI Code Review

### Backend Endpoints
- `GET /api/ai/chat/:problemId/history` – Get chat history for a problem
- `POST /api/ai/chat/:problemId` – Send chat message and get AI response
- `POST /api/ai/review/:problemId` – Request code review

### Frontend Modules
- `frontend/src/features/ai-chat/screens/AIChatScreen.tsx`
- `frontend/src/features/ai-chat/components/ChatBubble.tsx`
- `frontend/src/features/ai-chat/components/ChatInput.tsx`
- `frontend/src/features/ai-chat/components/FloatingChatButton.tsx`
- `frontend/src/features/ai-chat/hooks/useAIChat.ts`
- `frontend/src/features/ai-chat/store/chatStore.ts`
- `frontend/src/shared/api/endpoints/ai.api.ts`

### Expected Mapping
- `ai.api.ts`
  - `getChatHistory(problemId)` → `GET /api/ai/chat/:problemId/history`
  - `sendChatMessage(problemId, payload)` → `POST /api/ai/chat/:problemId`
  - `requestCodeReview(problemId, payload)` → `POST /api/ai/review/:problemId`
- `useAIChat.ts`
  - Manages chat messages, loading/error state
  - Calls `getChatHistory`, `sendChatMessage`, and optionally `requestCodeReview`
- `AIChatScreen.tsx`
  - Renders chat using `ChatBubble`, `ChatInput`
  - Opened from problem-solving context via `FloatingChatButton`

---

## 5. User Profile & Statistics

### Related Use Cases
- UC-8.1: View User Statistics
- UC-8.2: View Recent Activity
- UC-8.3: View/Update Settings

### Backend Endpoints
- `GET /api/users/me/stats` – Get user statistics
- `GET /api/users/me/activity` – Get user activity
- `GET /api/users/me/settings` – Get user settings
- `PUT /api/users/me/settings` – Update user settings

### Frontend Modules
- `frontend/src/features/profile/screens/ProfileScreen.tsx`
- `frontend/src/features/profile/screens/SettingsScreen.tsx`
- `frontend/src/features/profile/components/StatisticsCard.tsx`
- `frontend/src/features/profile/components/GitHubCard.tsx`
- `frontend/src/features/profile/components/StreakCalendar.tsx`
- `frontend/src/features/profile/hooks/useUserStats.ts`
- `frontend/src/features/profile/hooks/useGitHub.ts`
- `frontend/src/shared/api/endpoints/users.api.ts`

### Expected Mapping
- `users.api.ts`
  - `getMyStats()` → `GET /api/users/me/stats`
  - `getMyActivity(params)` → `GET /api/users/me/activity`
  - `getMySettings()` → `GET /api/users/me/settings`
  - `updateMySettings(payload)` → `PUT /api/users/me/settings`
- `useUserStats.ts`
  - Uses `getMyStats` and `getMyActivity`
- `useGitHub.ts`
  - Initially uses only profile data and submission history
  - Later can integrate with GitHub-related endpoints when they are implemented

---

## 6. GitHub Integration (Planned)

> Note: Backend GitHub routes are **not yet implemented** (`app.ts` has a TODO for `/api/github`).  
> Frontend GitHub feature modules should be implemented in a way that gracefully handles the absence of these endpoints until they are available.

### Planned Frontend Modules
- `frontend/src/features/github/components/GitHubConnectButton.tsx`
- `frontend/src/features/github/components/CommitStatusBadge.tsx`
- `frontend/src/features/github/hooks/useGitHubIntegration.ts`
- `frontend/src/shared/api/endpoints/github.api.ts`

### Planned Backend (from architecture)
- Future endpoints under ` /api/github` (e.g., connect GitHub account, sync contributions, fetch streak)

---

## 7. Shared Infrastructure (Frontend)

### API Client Layer
- `frontend/src/shared/api/client.ts`
  - Axios instance configured with:
    - `baseURL = API_URL` from frontend `.env`
    - `Authorization` header injection via interceptor
    - Error handling and logging
- `frontend/src/shared/api/interceptors/auth.interceptor.ts`
  - Attach JWT token from auth store
  - Handle 401/403 and trigger logout/refresh
- `frontend/src/shared/api/interceptors/error.interceptor.ts`
  - Normalize error shape for UI

### Navigation & App Shell
- `frontend/src/app/App.tsx`
- `frontend/src/app/navigation/RootNavigator.tsx`
- `frontend/src/app/navigation/AuthNavigator.tsx`
- `frontend/src/app/navigation/MainNavigator.tsx`
- `frontend/src/app/providers/AuthProvider.tsx`
- `frontend/src/app/providers/ThemeProvider.tsx`

These components do not talk directly to backend endpoints, but they orchestrate when feature screens (that use the above API mappings) are mounted.

---

## 8. Consistency Checklist

Before implementing frontend logic, verify:

1. **Every backend endpoint listed in `backend/src/app.ts` has a corresponding function in `frontend/src/shared/api/endpoints/*.api.ts`.**
2. **Every use case in `docs/use-cases.md` that requires server communication is covered by at least one frontend screen + hook + API function triple.**
3. **No implemented backend endpoint is “orphaned” (never used by any frontend feature), unless intentionally server-only.**
4. **Query parameters and path params in frontend API functions match the backend route definitions and validation schemas.**


