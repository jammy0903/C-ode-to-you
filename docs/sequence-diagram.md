# Sequence Diagram

## Overview
이 문서는 주요 사용자 시나리오에 대한 시퀀스 다이어그램을 제공합니다. 프론트엔드부터 백엔드까지의 전체 흐름을 시각화합니다.

---

## 1. Authentication Flow

### 1.1 Kakao Login

```mermaid
sequenceDiagram
    actor User
    participant LoginScreen
    participant useAuth Hook
    participant AuthStore
    participant AuthRepositoryImpl
    participant ApiClient
    participant Backend
    participant AuthController
    participant AuthService
    participant UserRepository
    participant Database
    participant SecureStorage

    User->>LoginScreen: Click Kakao Login
    LoginScreen->>useAuth Hook: loginWithKakao(code)
    useAuth Hook->>AuthStore: setLoading(true)

    useAuth Hook->>AuthRepositoryImpl: loginWithKakao(code)
    AuthRepositoryImpl->>ApiClient: POST /api/auth/kakao
    ApiClient->>Backend: POST /api/auth/kakao {code}

    Backend->>AuthController: loginWithKakao(req, res)
    AuthController->>AuthService: loginWithKakao(code)

    AuthService->>AuthService: validateKakaoCode(code)
    AuthService->>AuthService: getUserInfoFromKakao(code)

    AuthService->>UserRepository: findByProvider('kakao', providerId)
    UserRepository->>Database: SELECT * FROM users WHERE...
    Database-->>UserRepository: User | null

    alt User Not Found
        AuthService->>UserRepository: create(userData)
        UserRepository->>Database: INSERT INTO users...
        Database-->>UserRepository: New User
    end

    UserRepository-->>AuthService: User
    AuthService->>AuthService: generateTokens(user)
    AuthService-->>AuthController: {token, refreshToken, user}

    AuthController-->>Backend: sendSuccess(res, response)
    Backend-->>ApiClient: {token, refreshToken, user}
    ApiClient-->>AuthRepositoryImpl: AuthResponse

    AuthRepositoryImpl->>SecureStorage: Save tokens
    AuthRepositoryImpl-->>useAuth Hook: AuthResponse

    useAuth Hook->>AuthStore: setUser(user)
    useAuth Hook->>AuthStore: setLoading(false)
    AuthStore-->>LoginScreen: isAuthenticated = true

    LoginScreen->>LoginScreen: Navigate to Main
```

---

## 2. Problem Browsing Flow

### 2.1 Get Problem List with Filters

```mermaid
sequenceDiagram
    actor User
    participant ProblemListScreen
    participant useProblems Hook
    participant ProblemStore
    participant ProblemRepositoryImpl
    participant ApiClient
    participant Backend
    participant ProblemsController
    participant ProblemsService
    participant ProblemRepository
    participant Database

    User->>ProblemListScreen: Apply Filters (tags, difficulty)
    ProblemListScreen->>useProblems Hook: fetchProblems(filters)
    useProblems Hook->>ProblemStore: setLoading(true)

    useProblems Hook->>ProblemRepositoryImpl: getProblems(filters)
    ProblemRepositoryImpl->>ApiClient: GET /api/problems?tags=array&difficulty=silver_5
    ApiClient->>ApiClient: Add Authorization header
    ApiClient->>Backend: GET /api/problems?...

    Backend->>Backend: Auth Middleware (optional)
    Backend->>ProblemsController: getProblemList(req, res)
    ProblemsController->>ProblemsService: getProblemList(filters, userId?)

    ProblemsService->>ProblemRepository: findAll(filters, userId)

    ProblemRepository->>Database: SELECT * FROM problems WHERE...
    Database-->>ProblemRepository: Problems[]

    alt User is Authenticated
        ProblemRepository->>Database: SELECT * FROM submissions WHERE userId = ?
        Database-->>ProblemRepository: Submissions[]
        ProblemRepository->>ProblemRepository: Enhance problems with user stats
    end

    ProblemRepository-->>ProblemsService: {problems, total, page, limit}
    ProblemsService->>ProblemsService: Transform data
    ProblemsService-->>ProblemsController: {problems, pagination}

    ProblemsController-->>Backend: sendSuccess(res, result)
    Backend-->>ApiClient: {problems, pagination}
    ApiClient-->>ProblemRepositoryImpl: Response

    ProblemRepositoryImpl-->>useProblems Hook: {problems, pagination}
    useProblems Hook->>ProblemStore: setProblems(problems)
    useProblems Hook->>ProblemStore: setLoading(false)

    ProblemStore-->>ProblemListScreen: Re-render with new data
```

### 2.2 Get Problem Detail

```mermaid
sequenceDiagram
    actor User
    participant ProblemDetailScreen
    participant useProblemDetail Hook
    participant ProblemStore
    participant ProblemRepositoryImpl
    participant ApiClient
    participant Backend
    participant ProblemsController
    participant ProblemsService
    participant ProblemRepository
    participant Database

    User->>ProblemDetailScreen: Click on Problem
    ProblemDetailScreen->>useProblemDetail Hook: fetchProblemDetail(problemId)
    useProblemDetail Hook->>ProblemStore: setLoading(true)

    useProblemDetail Hook->>ProblemRepositoryImpl: getProblemById(problemId)
    ProblemRepositoryImpl->>ApiClient: GET /api/problems/:id
    ApiClient->>Backend: GET /api/problems/:id

    Backend->>ProblemsController: getProblemDetail(req, res)
    ProblemsController->>ProblemsService: getProblemById(id, userId?)

    ProblemsService->>ProblemRepository: findById(id)
    ProblemRepository->>Database: SELECT * FROM problems WHERE id = ?
    ProblemRepository->>Database: SELECT * FROM problem_functions WHERE problemId = ?
    Database-->>ProblemRepository: Problem with functions

    ProblemRepository-->>ProblemsService: Problem
    ProblemsService->>ProblemsService: Transform and add user stats
    ProblemsService-->>ProblemsController: Problem with metadata

    ProblemsController-->>Backend: sendSuccess(res, problem)
    Backend-->>ApiClient: Problem
    ApiClient-->>ProblemRepositoryImpl: Problem

    ProblemRepositoryImpl-->>useProblemDetail Hook: Problem
    useProblemDetail Hook->>ProblemStore: setCurrentProblem(problem)
    useProblemDetail Hook->>ProblemStore: setLoading(false)

    ProblemStore-->>ProblemDetailScreen: Re-render with problem
    ProblemDetailScreen->>ProblemDetailScreen: Display problem + functions
```

---

## 3. Code Submission Flow

### 3.1 Submit Code and Judge

```mermaid
sequenceDiagram
    actor User
    participant CodeEditorScreen
    participant useSubmission Hook
    participant SubmissionStore
    participant SubmissionRepositoryImpl
    participant SubmissionPollingService
    participant ApiClient
    participant Backend
    participant SubmissionsController
    participant SubmissionsService
    participant JudgeService
    participant SubmissionRepository
    participant GitHubService
    participant Database

    User->>CodeEditorScreen: Click Submit
    CodeEditorScreen->>useSubmission Hook: submitCode(problemId, code, language)
    useSubmission Hook->>SubmissionStore: setSubmitting(true)

    useSubmission Hook->>SubmissionRepositoryImpl: submitCode(problemId, code, language)
    SubmissionRepositoryImpl->>ApiClient: POST /api/submissions/:id/submit
    ApiClient->>Backend: POST /api/submissions/:id/submit {code, language}

    Backend->>SubmissionsController: submitCode(req, res)
    SubmissionsController->>SubmissionsService: submitCode(userId, problemId, code, language)

    SubmissionsService->>SubmissionRepository: create({userId, problemId, code, ...})
    SubmissionRepository->>Database: INSERT INTO submissions...
    Database-->>SubmissionRepository: Submission (verdict: 'judging')
    SubmissionRepository-->>SubmissionsService: Submission

    SubmissionsService-->>SubmissionsController: Submission
    SubmissionsController-->>Backend: sendSuccess(res, submission)
    Backend-->>ApiClient: Submission
    ApiClient-->>SubmissionRepositoryImpl: Submission

    SubmissionRepositoryImpl-->>useSubmission Hook: Submission
    useSubmission Hook->>SubmissionStore: setCurrentSubmission(submission)

    %% Start polling
    useSubmission Hook->>SubmissionPollingService: startPolling(submissionId)

    %% Background judging
    par Background Judging
        SubmissionsService->>JudgeService: judgeSubmission(code, problem, testCases)
        JudgeService->>JudgeService: compileCode(code)

        loop For each test case
            JudgeService->>JudgeService: runTestCase(executable, input, output)
        end

        JudgeService->>JudgeService: Calculate verdict
        JudgeService-->>SubmissionsService: {verdict, testResults, executionTime, memory}

        SubmissionsService->>SubmissionRepository: updateVerdict(id, verdict, results)
        SubmissionRepository->>Database: UPDATE submissions SET verdict = ?, ...
        Database-->>SubmissionRepository: Updated Submission

        %% GitHub commit
        SubmissionsService->>GitHubService: commitCode(userId, submissionId)
        GitHubService->>GitHubService: Create commit in user's repo
    end

    %% Polling loop
    loop Every 2 seconds
        SubmissionPollingService->>SubmissionRepositoryImpl: getSubmissionStatus(id)
        SubmissionRepositoryImpl->>ApiClient: GET /api/submissions/:id/status
        ApiClient->>Backend: GET /api/submissions/:id/status

        Backend->>SubmissionsController: getSubmissionStatus(req, res)
        SubmissionsController->>SubmissionsService: getSubmissionStatus(id)
        SubmissionsService->>SubmissionRepository: findById(id)
        SubmissionRepository->>Database: SELECT * FROM submissions WHERE id = ?
        Database-->>SubmissionRepository: Submission
        SubmissionRepository-->>SubmissionsService: Submission
        SubmissionsService-->>SubmissionsController: Submission
        SubmissionsController-->>Backend: sendSuccess(res, submission)
        Backend-->>ApiClient: Submission
        ApiClient-->>SubmissionRepositoryImpl: Submission
        SubmissionRepositoryImpl-->>SubmissionPollingService: Submission

        SubmissionPollingService->>SubmissionStore: setCurrentSubmission(submission)

        alt Verdict is Final
            SubmissionPollingService->>SubmissionPollingService: stopPolling()
            SubmissionPollingService->>SubmissionStore: setSubmitting(false)
        end
    end

    SubmissionStore-->>CodeEditorScreen: Navigate to Result Screen
```

---

## 4. AI Chat Flow

### 4.1 Send Chat Message

```mermaid
sequenceDiagram
    actor User
    participant AIChatScreen
    participant useAIChat Hook
    participant ChatStore
    participant AIRepositoryImpl
    participant ApiClient
    participant Backend
    participant AIController
    participant AIService
    participant OllamaService
    participant Database

    User->>AIChatScreen: Type message
    AIChatScreen->>useAIChat Hook: sendMessage(content, code?)

    useAIChat Hook->>ChatStore: Optimistic update - add user message
    useAIChat Hook->>ChatStore: setSending(true)

    useAIChat Hook->>AIRepositoryImpl: sendMessage(problemId, message, code)
    AIRepositoryImpl->>ApiClient: POST /api/ai/chat/:problemId
    ApiClient->>Backend: POST /api/ai/chat/:problemId {message, code?}

    Backend->>AIController: sendChatMessage(req, res)
    AIController->>AIService: sendChatMessage(userId, problemId, message, code?)

    %% Get or create conversation
    AIService->>Database: Get or create ai_conversation
    Database-->>AIService: Conversation

    %% Save user message
    AIService->>Database: INSERT INTO ai_messages (role='user', content=...)
    Database-->>AIService: User message saved

    %% Get problem context
    AIService->>Database: SELECT * FROM problems WHERE id = ?
    Database-->>AIService: Problem

    %% Generate AI response
    AIService->>OllamaService: generateResponse(prompt, context)
    OllamaService->>OllamaService: formatPrompt(problem, code, message)
    OllamaService->>OllamaService: Call Ollama API
    activate OllamaService
    Note over OllamaService: AI model processing<br/>(Qwen2.5-Coder)
    OllamaService-->>AIService: AI response text
    deactivate OllamaService

    %% Save AI response
    AIService->>Database: INSERT INTO ai_messages (role='assistant', content=...)
    Database-->>AIService: AI message saved

    AIService-->>AIController: {message, conversationId}
    AIController-->>Backend: sendSuccess(res, response)
    Backend-->>ApiClient: ChatMessage
    ApiClient-->>AIRepositoryImpl: ChatMessage

    AIRepositoryImpl-->>useAIChat Hook: ChatMessage
    useAIChat Hook->>ChatStore: Add AI message
    useAIChat Hook->>ChatStore: setSending(false)

    ChatStore-->>AIChatScreen: Re-render with new message
```

### 4.2 Request Code Review

```mermaid
sequenceDiagram
    actor User
    participant CodeEditorScreen
    participant useAIChat Hook
    participant AIRepositoryImpl
    participant ApiClient
    participant Backend
    participant AIController
    participant AIService
    participant OllamaService

    User->>CodeEditorScreen: Click "AI Code Review"
    CodeEditorScreen->>useAIChat Hook: requestCodeReview(code, problemId)

    useAIChat Hook->>AIRepositoryImpl: requestCodeReview(problemId, code)
    AIRepositoryImpl->>ApiClient: POST /api/ai/review/:problemId
    ApiClient->>Backend: POST /api/ai/review/:problemId {code}

    Backend->>AIController: requestCodeReview(req, res)
    AIController->>AIService: requestCodeReview(code, problemId)

    AIService->>AIService: Format review prompt
    AIService->>OllamaService: generateResponse(reviewPrompt, code)

    OllamaService->>OllamaService: Call Ollama API with review instructions
    activate OllamaService
    Note over OllamaService: AI analyzes:<br/>- Code quality<br/>- Potential bugs<br/>- Optimizations<br/>- C best practices
    OllamaService-->>AIService: Review feedback
    deactivate OllamaService

    AIService-->>AIController: Review response
    AIController-->>Backend: sendSuccess(res, review)
    Backend-->>ApiClient: Review
    ApiClient-->>AIRepositoryImpl: Review

    AIRepositoryImpl-->>useAIChat Hook: Review
    useAIChat Hook-->>CodeEditorScreen: Display review
```

---

## 5. GitHub Integration Flow

### 5.1 Connect GitHub Account

```mermaid
sequenceDiagram
    actor User
    participant SettingsScreen
    participant useGitHub Hook
    participant UserStore
    participant GitHubRepositoryImpl
    participant ApiClient
    participant Backend
    participant GitHubController
    participant GitHubService
    participant Database
    participant GitHubAPI

    User->>SettingsScreen: Click "Connect GitHub"
    SettingsScreen->>SettingsScreen: Open GitHub OAuth

    User->>GitHubAPI: Authorize app
    GitHubAPI-->>SettingsScreen: OAuth callback with code

    SettingsScreen->>useGitHub Hook: connectGitHub(accessToken)
    useGitHub Hook->>GitHubRepositoryImpl: connect(accessToken)
    GitHubRepositoryImpl->>ApiClient: POST /api/github/connect
    ApiClient->>Backend: POST /api/github/connect {accessToken}

    Backend->>GitHubController: connectGitHub(req, res)
    GitHubController->>GitHubService: connectGitHub(userId, accessToken)

    GitHubService->>GitHubAPI: Get user info
    GitHubAPI-->>GitHubService: {username, ...}

    GitHubService->>GitHubAPI: Check if repo exists
    alt Repository doesn't exist
        GitHubService->>GitHubAPI: Create repository
        GitHubAPI-->>GitHubService: Repository created
    end

    GitHubService->>Database: INSERT INTO github_connections...
    Database-->>GitHubService: Connection saved

    GitHubService-->>GitHubController: Connection data
    GitHubController-->>Backend: sendSuccess(res, connection)
    Backend-->>ApiClient: Connection
    ApiClient-->>GitHubRepositoryImpl: Connection

    GitHubRepositoryImpl-->>useGitHub Hook: Connection
    useGitHub Hook->>UserStore: Update connection status
    UserStore-->>SettingsScreen: Re-render with connection
```

### 5.2 Auto-Commit Submission

```mermaid
sequenceDiagram
    participant SubmissionsService
    participant GitHubService
    participant Database
    participant GitHubAPI

    Note over SubmissionsService: After submission is judged

    SubmissionsService->>GitHubService: commitCode(userId, submissionId)

    GitHubService->>Database: SELECT * FROM github_connections WHERE userId = ?
    Database-->>GitHubService: GitHub connection

    alt GitHub not connected
        GitHubService-->>SubmissionsService: Skip commit
    end

    GitHubService->>Database: SELECT * FROM submissions WHERE id = ?
    GitHubService->>Database: SELECT * FROM problems WHERE id = ?
    Database-->>GitHubService: Submission + Problem

    GitHubService->>GitHubService: Prepare commit data
    Note over GitHubService: File: c/problem_<number>.c<br/>Message: "Solved: [BOJ #1000] A+B"<br/>or "Attempted: [BOJ #1000] A+B"

    GitHubService->>GitHubAPI: Create file commit
    GitHubAPI-->>GitHubService: {commitSha, commitUrl}

    GitHubService->>Database: INSERT INTO github_commits...
    Database-->>GitHubService: Commit record saved

    GitHubService-->>SubmissionsService: Commit successful
```

---

## 6. User Statistics Flow

### 6.1 Get User Statistics

```mermaid
sequenceDiagram
    actor User
    participant ProfileScreen
    participant useUserStats Hook
    participant UserStore
    participant UserRepositoryImpl
    participant ApiClient
    participant Backend
    participant UsersController
    participant UsersService
    participant UserRepository
    participant Database

    User->>ProfileScreen: Navigate to Profile
    ProfileScreen->>useUserStats Hook: fetchStats()
    useUserStats Hook->>UserStore: setLoading(true)

    useUserStats Hook->>UserRepositoryImpl: getStats()
    UserRepositoryImpl->>ApiClient: GET /api/users/me/stats
    ApiClient->>Backend: GET /api/users/me/stats

    Backend->>UsersController: getUserStats(req, res)
    UsersController->>UsersService: getUserStats(userId)

    UsersService->>UserRepository: getStats(userId)

    par Get Statistics
        UserRepository->>Database: Count total submissions
        UserRepository->>Database: Count solved problems (verdict='accepted')
        UserRepository->>Database: Count attempted problems
        UserRepository->>Database: Calculate success rate
        UserRepository->>Database: Group by difficulty
    end

    Database-->>UserRepository: Statistics data
    UserRepository-->>UsersService: Stats

    UsersService->>UsersService: Transform data
    UsersService-->>UsersController: UserStats

    UsersController-->>Backend: sendSuccess(res, stats)
    Backend-->>ApiClient: UserStats
    ApiClient-->>UserRepositoryImpl: UserStats

    UserRepositoryImpl-->>useUserStats Hook: UserStats
    useUserStats Hook->>UserStore: setStats(stats)
    useUserStats Hook->>UserStore: setLoading(false)

    UserStore-->>ProfileScreen: Re-render with stats
```

---

## 7. Error Handling Flow

### 7.1 API Error with Token Refresh

```mermaid
sequenceDiagram
    participant Component
    participant Hook
    participant Repository
    participant ApiClient
    participant ErrorInterceptor
    participant AuthInterceptor
    participant Backend
    participant SecureStorage

    Component->>Hook: performAction()
    Hook->>Repository: callAPI()
    Repository->>ApiClient: request()
    ApiClient->>Backend: API Request

    Backend-->>ApiClient: 401 Unauthorized
    ApiClient->>ErrorInterceptor: onResponseError(error)

    ErrorInterceptor->>ErrorInterceptor: Check if 401
    ErrorInterceptor->>ErrorInterceptor: Queue original request

    ErrorInterceptor->>SecureStorage: Get refresh token
    SecureStorage-->>ErrorInterceptor: refreshToken

    ErrorInterceptor->>Backend: POST /api/auth/refresh {refreshToken}

    alt Refresh Token Valid
        Backend-->>ErrorInterceptor: {token, refreshToken}
        ErrorInterceptor->>SecureStorage: Save new tokens

        ErrorInterceptor->>ErrorInterceptor: Retry queued requests
        ErrorInterceptor->>ApiClient: Retry original request
        ApiClient->>Backend: Original request with new token
        Backend-->>ApiClient: Success response
        ApiClient-->>Repository: Data
        Repository-->>Hook: Data
        Hook-->>Component: Success
    else Refresh Token Invalid
        ErrorInterceptor->>SecureStorage: Clear tokens
        ErrorInterceptor->>ErrorInterceptor: Logout user
        ErrorInterceptor-->>Component: Navigate to Login
    end
```

---

## 8. Real-time Polling Flow

### 8.1 Submission Status Polling

```mermaid
sequenceDiagram
    participant useSubmission Hook
    participant SubmissionPollingService
    participant ApiClient
    participant Backend
    participant Database

    useSubmission Hook->>SubmissionPollingService: startPolling(submissionId)

    loop Every 2 seconds
        SubmissionPollingService->>ApiClient: GET /api/submissions/:id/status
        ApiClient->>Backend: GET /api/submissions/:id/status
        Backend->>Database: SELECT * FROM submissions WHERE id = ?
        Database-->>Backend: Submission
        Backend-->>ApiClient: Submission
        ApiClient-->>SubmissionPollingService: Submission

        alt Verdict is 'judging'
            SubmissionPollingService->>SubmissionPollingService: Continue polling
        else Verdict is final
            SubmissionPollingService->>SubmissionPollingService: stopPolling()
            SubmissionPollingService->>useSubmission Hook: Final submission
        end
    end
```

---

## 9. Data Caching and State Management

### 9.1 Store Update Flow

```mermaid
sequenceDiagram
    participant Component
    participant Hook
    participant Store
    participant Repository
    participant ApiClient

    Component->>Hook: Action (e.g., fetchProblems)
    Hook->>Store: Check cached data

    alt Data is cached and fresh
        Store-->>Hook: Return cached data
        Hook-->>Component: Display cached data
    else Data is stale or missing
        Hook->>Store: setLoading(true)
        Hook->>Repository: fetchData()
        Repository->>ApiClient: API request
        ApiClient-->>Repository: Response
        Repository-->>Hook: Data
        Hook->>Store: setData(data)
        Hook->>Store: setLoading(false)
        Store-->>Component: Re-render with new data
    end
```

---

## 10. Code Auto-Save Flow

### 10.1 Draft Auto-Save

```mermaid
sequenceDiagram
    actor User
    participant CodeEditorScreen
    participant useCodeEditor Hook
    participant EditorStore
    participant SubmissionRepositoryImpl
    participant ApiClient
    participant Backend
    participant Database

    User->>CodeEditorScreen: Type code
    CodeEditorScreen->>useCodeEditor Hook: setCode(code)
    useCodeEditor Hook->>EditorStore: setCode(code)
    useCodeEditor Hook->>EditorStore: setDirty(true)

    Note over useCodeEditor Hook: useDebounce(30 seconds)

    useCodeEditor Hook->>useCodeEditor Hook: autoSave()
    useCodeEditor Hook->>SubmissionRepositoryImpl: saveDraft(problemId, code)
    SubmissionRepositoryImpl->>ApiClient: POST /api/submissions/:problemId/draft
    ApiClient->>Backend: POST /api/submissions/:problemId/draft {code}

    Backend->>Database: INSERT INTO drafts ... ON CONFLICT UPDATE
    Database-->>Backend: Draft saved
    Backend-->>ApiClient: Success
    ApiClient-->>SubmissionRepositoryImpl: Success
    SubmissionRepositoryImpl-->>useCodeEditor Hook: Draft saved

    useCodeEditor Hook->>EditorStore: setDirty(false)
```

---

**Last Updated**: 2025-12-04
**Version**: 1.0.0
