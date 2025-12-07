# Class Diagram

## Overview
이 문서는 프로젝트의 클래스 구조를 백엔드와 프론트엔드로 나누어 시각화합니다.

---

## 1. Backend Class Diagram

### 1.1 Overall Backend Architecture

```mermaid
classDiagram
    %% Controllers Layer
    class ProblemsController {
        -service: ProblemsService
        +getProblemList(req, res)
        +searchProblems(req, res)
        +getProblemStats(req, res)
        +getProblemDetail(req, res)
        +getRecommendedFunctions(req, res)
    }

    class SubmissionsController {
        -service: SubmissionsService
        +submitCode(req, res)
        +getSubmissionStatus(req, res)
        +getSubmissionHistory(req, res)
        +getWrongAnswers(req, res)
        +getDraft(req, res)
        +saveDraft(req, res)
    }

    class AuthController {
        -service: AuthService
        +loginWithKakao(req, res)
        +loginWithGoogle(req, res)
        +refreshToken(req, res)
        +logout(req, res)
    }

    class AIController {
        -service: AIService
        +sendChatMessage(req, res)
        +getChatHistory(req, res)
        +requestCodeReview(req, res)
    }

    class GitHubController {
        -service: GitHubService
        +connectGitHub(req, res)
        +disconnectGitHub(req, res)
        +getConnectionStatus(req, res)
        +commitSubmission(req, res)
    }

    class UsersController {
        -service: UsersService
        +getProfile(req, res)
        +getUserStats(req, res)
        +updateSettings(req, res)
        +getActivity(req, res)
    }

    %% Services Layer
    class ProblemsService {
        -problemRepo: ProblemRepository
        +getProblemList(filters, userId?)
        +getProblemById(id, userId?)
        +searchProblems(query)
        +getProblemStats(userId?)
        +getRecommendedFunctions(problemId)
    }

    class SubmissionsService {
        -submissionRepo: SubmissionRepository
        -problemRepo: ProblemRepository
        -judgeService: JudgeService
        -githubService: GitHubService
        +submitCode(userId, problemId, code, language)
        +getSubmissionStatus(submissionId)
        +getSubmissionHistory(userId, filters)
        +getWrongAnswers(userId)
        +saveDraft(userId, problemId, code)
        +getDraft(userId, problemId)
    }

    class AuthService {
        -userRepo: UserRepository
        +loginWithKakao(code)
        +loginWithGoogle(token)
        +refreshToken(refreshToken)
        +logout(userId)
        -generateTokens(user)
    }

    class AIService {
        -ollamaService: OllamaService
        +sendChatMessage(userId, problemId, message, code?)
        +getChatHistory(userId, problemId)
        +requestCodeReview(code, problemId)
    }

    class GitHubService {
        +connectGitHub(userId, accessToken)
        +disconnectGitHub(userId)
        +getConnectionStatus(userId)
        +commitCode(userId, submissionId)
        -createCommit(repo, file, message)
    }

    class UsersService {
        -userRepo: UserRepository
        +getProfile(userId)
        +getUserStats(userId)
        +updateSettings(userId, settings)
        +getActivity(userId, days)
    }

    class JudgeService {
        +judgeSubmission(code, problem, testCases)
        +compileCode(code)
        +runTestCase(executable, input, expectedOutput)
        -checkVerdict(result)
    }

    class OllamaService {
        +generateResponse(prompt, context)
        +formatPrompt(problem, code, message)
        -callOllamaAPI(payload)
    }

    class SolvedACService {
        +fetchProblemById(number)
        +fetchProblems(params)
        +syncProblem(number)
        -transformToInternalFormat(problem)
    }

    %% Repository Layer
    class ProblemRepository {
        +findAll(filters, userId?)
        +findById(id)
        +findByNumber(number)
        +search(query)
        +getStats(userId?)
        +getFunctions(problemId)
        +validateAndGet(problemId)
    }

    class SubmissionRepository {
        +create(data)
        +findById(id)
        +findByUserId(userId, filters)
        +findByProblemId(problemId, userId?)
        +updateVerdict(id, verdict, results)
        +getWrongAnswers(userId)
        +saveDraft(userId, problemId, code)
        +getDraft(userId, problemId)
    }

    class UserRepository {
        +create(data)
        +findById(id)
        +findByEmail(email)
        +findByProvider(provider, providerId)
        +updateSettings(userId, settings)
        +getStats(userId)
        +getActivity(userId, days)
    }

    %% Middleware
    class AuthMiddleware {
        +authenticate(req, res, next)
        +optionalAuth(req, res, next)
        -verifyToken(token)
    }

    class ValidationMiddleware {
        +validate(schema)
        -handleValidationError(error)
    }

    class ErrorMiddleware {
        +handleError(err, req, res, next)
        +notFound(req, res, next)
    }

    class RateLimitMiddleware {
        +createRateLimiter(options)
        +apiLimiter()
        +authLimiter()
    }

    %% Models (Prisma)
    class User {
        +id: string
        +email: string
        +name: string
        +provider: Provider
        +providerId: string
        +createdAt: DateTime
        +updatedAt: DateTime
    }

    class Problem {
        +id: string
        +number: number
        +title: string
        +description: string
        +inputFormat: string
        +outputFormat: string
        +difficulty: string
        +tags: Json
        +timeLimit: number
        +memoryLimit: number
        +examples: Json
        +acceptedCount: number
        +submissionCount: number
    }

    class Submission {
        +id: string
        +userId: string
        +problemId: string
        +code: string
        +language: string
        +verdict: Verdict
        +executionTime: number?
        +memoryUsage: number?
        +testResults: Json
        +submittedAt: DateTime
        +judgedAt: DateTime?
    }

    class AiConversation {
        +id: string
        +userId: string
        +problemId: string
        +createdAt: DateTime
        +updatedAt: DateTime
    }

    class AiMessage {
        +id: string
        +conversationId: string
        +role: Role
        +content: string
        +createdAt: DateTime
    }

    class GithubConnection {
        +id: string
        +userId: string
        +githubUsername: string
        +accessToken: string
        +repositoryUrl: string
        +connectedAt: DateTime
    }

    class GithubCommit {
        +id: string
        +submissionId: string
        +commitSha: string
        +commitUrl: string
        +commitMessage: string
        +committedAt: DateTime
    }

    class UserSettings {
        +id: string
        +userId: string
        +editorSettings: Json
        +aiSettings: Json
        +githubSettings: Json
        +notificationSettings: Json
    }

    class ProblemFunction {
        +id: string
        +problemId: string
        +category: string
        +functionName: string
        +headerFile: string?
        +description: string
        +example: string?
        +displayOrder: number
    }

    class Draft {
        +id: string
        +userId: string
        +problemId: string
        +code: string
        +savedAt: DateTime
    }

    %% Relationships - Controllers to Services
    ProblemsController --> ProblemsService
    SubmissionsController --> SubmissionsService
    AuthController --> AuthService
    AIController --> AIService
    GitHubController --> GitHubService
    UsersController --> UsersService

    %% Relationships - Services to Repositories
    ProblemsService --> ProblemRepository
    SubmissionsService --> SubmissionRepository
    SubmissionsService --> ProblemRepository
    SubmissionsService --> JudgeService
    SubmissionsService --> GitHubService
    AuthService --> UserRepository
    UsersService --> UserRepository
    AIService --> OllamaService

    %% Relationships - Services to Services
    ProblemsService --> SolvedACService

    %% Relationships - Repositories to Models
    ProblemRepository ..> Problem
    ProblemRepository ..> ProblemFunction
    SubmissionRepository ..> Submission
    SubmissionRepository ..> Draft
    UserRepository ..> User
    UserRepository ..> UserSettings

    %% Relationships - Models
    User "1" --o "0..*" Submission
    User "1" --o "0..*" AiConversation
    User "1" --o "0..*" Draft
    User "1" --o "0..1" GithubConnection
    User "1" --o "0..1" UserSettings

    Problem "1" --o "0..*" Submission
    Problem "1" --o "0..*" ProblemFunction
    Problem "1" --o "0..*" AiConversation
    Problem "1" --o "0..*" Draft

    Submission "1" --o "0..1" GithubCommit
    AiConversation "1" --o "0..*" AiMessage
```

### 1.2 Backend Module Structure

```mermaid
classDiagram
    %% Auth Module
    namespace Auth {
        class AuthRoutes {
            +POST /api/auth/kakao
            +POST /api/auth/google
            +POST /api/auth/refresh
            +POST /api/auth/logout
        }

        class AuthController
        class AuthService
        class AuthValidation {
            +kakaoLoginSchema
            +googleLoginSchema
            +refreshTokenSchema
        }

        class AuthTypes {
            <<interface>>
            +KakaoLoginRequest
            +GoogleLoginRequest
            +AuthResponse
            +TokenPayload
        }
    }

    %% Problems Module
    namespace Problems {
        class ProblemsRoutes {
            +GET /api/problems
            +GET /api/problems/search
            +GET /api/problems/stats
            +GET /api/problems/:id
            +GET /api/problems/:id/functions
        }

        class ProblemsController
        class ProblemsService
        class SolvedACService

        class ProblemsValidation {
            +getProblemListSchema
            +searchProblemsSchema
        }

        class ProblemsTypes {
            <<interface>>
            +ProblemFilters
            +FunctionApproach
            +ProblemWithUserStats
        }

        class SolvedACTypes {
            <<interface>>
            +SolvedACProblem
            +SolvedACProblemDetail
        }
    }

    %% Submissions Module
    namespace Submissions {
        class SubmissionsRoutes {
            +POST /api/submissions/:problemId/submit
            +GET /api/submissions/:id/status
            +GET /api/submissions/history
            +GET /api/submissions/wrong
            +POST /api/submissions/:problemId/draft
            +GET /api/submissions/:problemId/draft
        }

        class SubmissionsController
        class SubmissionsService
        class JudgeService

        class SubmissionsValidation {
            +submitCodeSchema
            +saveDraftSchema
        }

        class SubmissionsTypes {
            <<interface>>
            +SubmitCodeRequest
            +SubmissionResponse
            +TestResult
        }
    }

    %% AI Module
    namespace AI {
        class AIRoutes {
            +POST /api/ai/chat/:problemId
            +GET /api/ai/chat/:problemId/history
            +POST /api/ai/review/:problemId
        }

        class AIController
        class AIService
        class OllamaService

        class AIValidation {
            +sendMessageSchema
            +codeReviewSchema
        }

        class AITypes {
            <<interface>>
            +ChatMessageRequest
            +ChatMessageResponse
            +CodeReviewRequest
        }
    }

    %% GitHub Module
    namespace GitHub {
        class GitHubRoutes {
            +POST /api/github/connect
            +DELETE /api/github/disconnect
            +GET /api/github/status
            +POST /api/github/commit
        }

        class GitHubController
        class GitHubService

        class GitHubValidation {
            +connectSchema
            +commitSchema
        }

        class GitHubTypes {
            <<interface>>
            +GitHubConnection
            +CommitRequest
            +CommitResponse
        }
    }

    %% Users Module
    namespace Users {
        class UsersRoutes {
            +GET /api/users/me
            +GET /api/users/me/stats
            +GET /api/users/me/settings
            +PUT /api/users/me/settings
            +GET /api/users/me/activity
        }

        class UsersController
        class UsersService

        class UsersValidation {
            +updateSettingsSchema
        }

        class UsersTypes {
            <<interface>>
            +UserProfile
            +UserStats
            +UserSettings
        }
    }

    AuthRoutes --> AuthController
    AuthController --> AuthService

    ProblemsRoutes --> ProblemsController
    ProblemsController --> ProblemsService
    ProblemsService --> SolvedACService

    SubmissionsRoutes --> SubmissionsController
    SubmissionsController --> SubmissionsService
    SubmissionsService --> JudgeService

    AIRoutes --> AIController
    AIController --> AIService
    AIService --> OllamaService

    GitHubRoutes --> GitHubController
    GitHubController --> GitHubService

    UsersRoutes --> UsersController
    UsersController --> UsersService
```

---

## 2. Frontend Class Diagram

### 2.1 Overall Frontend Architecture

```mermaid
classDiagram
    %% Screens
    class LoginScreen {
        +render()
        -handleKakaoLogin()
        -handleGoogleLogin()
    }

    class ProblemListScreen {
        -problems: Problem[]
        -filters: ProblemFilters
        +render()
        -handleSearch(query)
        -handleFilter(filters)
        -handleProblemSelect(id)
    }

    class ProblemDetailScreen {
        -problem: Problem
        -functions: FunctionApproach[]
        +render()
        -handleStartCoding()
        -handleOpenChat()
    }

    class CodeEditorScreen {
        -code: string
        -isDirty: boolean
        +render()
        -handleCodeChange(code)
        -handleSubmit()
        -handleAIHelp()
    }

    class SubmissionResultScreen {
        -submission: Submission
        +render()
        -handleRetry()
        -handleViewGitHub()
    }

    class AIChatScreen {
        -messages: ChatMessage[]
        -isLoading: boolean
        +render()
        -handleSendMessage(content)
        -handleCloseChat()
    }

    class ProfileScreen {
        -user: User
        -stats: UserStats
        +render()
        -handleSettingsClick()
    }

    class SettingsScreen {
        -settings: UserSettings
        +render()
        -handleUpdateSettings(settings)
        -handleConnectGitHub()
    }

    class WrongAnswersScreen {
        -wrongAnswers: Problem[]
        +render()
        -handleRetryProblem(id)
    }

    %% Hooks
    class useAuth {
        +user: User | null
        +isAuthenticated: boolean
        +isLoading: boolean
        +loginWithKakao(code)
        +loginWithGoogle(token)
        +logout()
    }

    class useProblems {
        +problems: Problem[]
        +isLoading: boolean
        +error: string | null
        +pagination: PaginationMeta
        +fetchProblems(filters)
        +searchProblems(query)
    }

    class useProblemDetail {
        +problem: Problem | null
        +functions: FunctionApproach[]
        +isLoading: boolean
        +fetchProblemDetail(id)
    }

    class useCodeEditor {
        +code: string
        +isDirty: boolean
        +setCode(code)
        +resetCode()
        +autoSave()
    }

    class useSubmission {
        +currentSubmission: Submission | null
        +isSubmitting: boolean
        +submitCode(problemId, code, language)
        +pollStatus(submissionId)
    }

    class useAIChat {
        +messages: ChatMessage[]
        +isSending: boolean
        +sendMessage(content, code?)
        +loadHistory(problemId)
    }

    class useUserStats {
        +stats: UserStats | null
        +isLoading: boolean
        +fetchStats()
        +fetchActivity(days)
    }

    class useGitHub {
        +isConnected: boolean
        +username: string | null
        +connectGitHub(accessToken)
        +disconnectGitHub()
    }

    class useWrongAnswers {
        +wrongAnswers: Problem[]
        +isLoading: boolean
        +fetchWrongAnswers()
    }

    %% Stores (Zustand)
    class AuthStore {
        +user: User | null
        +isAuthenticated: boolean
        +isLoading: boolean
        +setUser(user)
        +clearUser()
        +setLoading(loading)
    }

    class ProblemStore {
        +problems: Problem[]
        +currentProblem: Problem | null
        +filters: ProblemFilters
        +isLoading: boolean
        +error: string | null
        +setProblems(problems)
        +setCurrentProblem(problem)
        +setFilters(filters)
        +setLoading(loading)
        +setError(error)
    }

    class EditorStore {
        +code: string
        +isDirty: boolean
        +autoSaveEnabled: boolean
        +setCode(code)
        +resetCode()
        +setDirty(isDirty)
    }

    class SubmissionStore {
        +currentSubmission: Submission | null
        +history: Submission[]
        +isSubmitting: boolean
        +error: string | null
        +setCurrentSubmission(submission)
        +setSubmitting(submitting)
        +addToHistory(submission)
        +setError(error)
    }

    class ChatStore {
        +messages: ChatMessage[]
        +isSending: boolean
        +error: string | null
        +addMessage(message)
        +setMessages(messages)
        +setSending(sending)
        +setError(error)
    }

    class UserStore {
        +stats: UserStats | null
        +settings: UserSettings | null
        +isLoading: boolean
        +setStats(stats)
        +setSettings(settings)
        +setLoading(loading)
    }

    %% Services
    class ProblemFilterService {
        +filterProblems(problems, filters)
        +parseTags(tagString)
        +validateDifficulty(difficulty)
    }

    class SubmissionPollingService {
        -intervalId: NodeJS.Timer | null
        +startPolling(submissionId, callback)
        +stopPolling()
        +isPolling()
    }

    class ValidationService {
        +validateCode(code)
        +validateEmail(email)
        +validateSettings(settings)
    }

    %% Repositories
    class IProblemRepository {
        <<interface>>
        +getProblems(params)
        +getProblemById(id)
        +searchProblems(query)
        +getStats(userId?)
        +getFunctions(problemId)
    }

    class ISubmissionRepository {
        <<interface>>
        +submitCode(problemId, code, language)
        +getSubmissionStatus(id)
        +getHistory(params)
        +getWrongAnswers()
        +saveDraft(problemId, code)
        +getDraft(problemId)
    }

    class IUserRepository {
        <<interface>>
        +getProfile()
        +getStats()
        +updateSettings(settings)
        +getActivity(days)
    }

    class IAIRepository {
        <<interface>>
        +sendMessage(problemId, message, code?)
        +getChatHistory(problemId)
        +requestCodeReview(problemId, code)
    }

    class IGitHubRepository {
        <<interface>>
        +connect(accessToken)
        +disconnect()
        +getStatus()
        +commitSubmission(submissionId)
    }

    class ProblemRepositoryImpl {
        +getProblems(params)
        +getProblemById(id)
        +searchProblems(query)
        +getStats(userId?)
        +getFunctions(problemId)
    }

    class SubmissionRepositoryImpl {
        +submitCode(problemId, code, language)
        +getSubmissionStatus(id)
        +getHistory(params)
        +getWrongAnswers()
        +saveDraft(problemId, code)
        +getDraft(problemId)
    }

    class UserRepositoryImpl {
        +getProfile()
        +getStats()
        +updateSettings(settings)
        +getActivity(days)
    }

    class AIRepositoryImpl {
        +sendMessage(problemId, message, code?)
        +getChatHistory(problemId)
        +requestCodeReview(problemId, code)
    }

    class GitHubRepositoryImpl {
        +connect(accessToken)
        +disconnect()
        +getStatus()
        +commitSubmission(submissionId)
    }

    %% API Client
    class ApiClient {
        -axiosInstance: AxiosInstance
        +get(url, config?)
        +post(url, data?, config?)
        +put(url, data?, config?)
        +delete(url, config?)
        -setupInterceptors()
    }

    class AuthInterceptor {
        +onRequest(config)
        +onRequestError(error)
    }

    class ErrorInterceptor {
        +onResponse(response)
        +onResponseError(error)
        -handleRefreshToken()
    }

    %% Relationships - Screens to Hooks
    LoginScreen --> useAuth
    ProblemListScreen --> useProblems
    ProblemDetailScreen --> useProblemDetail
    CodeEditorScreen --> useCodeEditor
    CodeEditorScreen --> useSubmission
    SubmissionResultScreen --> useSubmission
    AIChatScreen --> useAIChat
    ProfileScreen --> useUserStats
    SettingsScreen --> useUserStats
    SettingsScreen --> useGitHub
    WrongAnswersScreen --> useWrongAnswers

    %% Relationships - Hooks to Stores
    useAuth --> AuthStore
    useProblems --> ProblemStore
    useProblemDetail --> ProblemStore
    useCodeEditor --> EditorStore
    useSubmission --> SubmissionStore
    useAIChat --> ChatStore
    useUserStats --> UserStore
    useGitHub --> UserStore

    %% Relationships - Hooks to Services
    useProblems --> ProblemFilterService
    useSubmission --> SubmissionPollingService
    useCodeEditor --> ValidationService

    %% Relationships - Stores to Repositories
    ProblemStore --> IProblemRepository
    SubmissionStore --> ISubmissionRepository
    UserStore --> IUserRepository
    ChatStore --> IAIRepository
    UserStore --> IGitHubRepository

    %% Relationships - Implementations
    IProblemRepository <|.. ProblemRepositoryImpl
    ISubmissionRepository <|.. SubmissionRepositoryImpl
    IUserRepository <|.. UserRepositoryImpl
    IAIRepository <|.. AIRepositoryImpl
    IGitHubRepository <|.. GitHubRepositoryImpl

    %% Relationships - Repositories to ApiClient
    ProblemRepositoryImpl --> ApiClient
    SubmissionRepositoryImpl --> ApiClient
    UserRepositoryImpl --> ApiClient
    AIRepositoryImpl --> ApiClient
    GitHubRepositoryImpl --> ApiClient

    %% Relationships - ApiClient to Interceptors
    ApiClient --> AuthInterceptor
    ApiClient --> ErrorInterceptor
```

### 2.2 Frontend Component Structure

```mermaid
classDiagram
    %% Shared Components
    class Button {
        +variant: ButtonVariant
        +size: ButtonSize
        +disabled: boolean
        +onPress()
        +render()
    }

    class Input {
        +value: string
        +placeholder: string
        +onChangeText(text)
        +render()
    }

    class Loading {
        +size: LoadingSize
        +color: string
        +render()
    }

    class ErrorBoundary {
        +children: ReactNode
        +fallback: ReactNode
        +componentDidCatch(error, info)
        +render()
    }

    class ScreenContainer {
        +children: ReactNode
        +showHeader: boolean
        +title: string
        +render()
    }

    %% Problem Components
    class ProblemCard {
        +problem: Problem
        +onPress()
        +render()
    }

    class SearchBar {
        +value: string
        +onSearch(query)
        +render()
    }

    class ProblemFilter {
        +filters: ProblemFilters
        +onFilterChange(filters)
        +render()
    }

    class FunctionRecommendations {
        +approaches: FunctionApproach[]
        +render()
    }

    %% Editor Components
    class CodeEditor {
        +code: string
        +language: string
        +onChange(code)
        +render()
    }

    class CodeMirrorWebView {
        +code: string
        +theme: string
        +onCodeChange(code)
        +render()
    }

    class EditorToolbar {
        +onSubmit()
        +onReset()
        +onAIHelp()
        +render()
    }

    %% Submission Components
    class SubmissionCard {
        +submission: Submission
        +onPress()
        +render()
    }

    class VerdictBadge {
        +verdict: Verdict
        +render()
    }

    class TestCaseResult {
        +testCase: TestResult
        +render()
    }

    %% AI Chat Components
    class ChatBubble {
        +message: ChatMessage
        +isUser: boolean
        +render()
    }

    class ChatInput {
        +value: string
        +onSend(message)
        +disabled: boolean
        +render()
    }

    class FloatingChatButton {
        +onPress()
        +render()
    }

    %% Profile Components
    class StatisticsCard {
        +stats: UserStats
        +render()
    }

    class StreakCalendar {
        +activity: ActivityData[]
        +render()
    }

    class GitHubCard {
        +isConnected: boolean
        +username: string?
        +onConnect()
        +onDisconnect()
        +render()
    }

    %% GitHub Components
    class GitHubConnectButton {
        +onPress()
        +render()
    }

    class CommitStatusBadge {
        +commitUrl: string?
        +render()
    }

    %% Wrong Answer Components
    class WrongAnswerCard {
        +problem: Problem
        +attempts: number
        +lastAttemptAt: Date
        +onRetry()
        +render()
    }

    %% Auth Components
    class KakaoButton {
        +onPress()
        +render()
    }

    class GoogleButton {
        +onPress()
        +render()
    }

    %% Component Composition
    ProblemListScreen ..> ProblemCard
    ProblemListScreen ..> SearchBar
    ProblemListScreen ..> ProblemFilter
    ProblemListScreen ..> ScreenContainer

    ProblemDetailScreen ..> FunctionRecommendations
    ProblemDetailScreen ..> FloatingChatButton
    ProblemDetailScreen ..> ScreenContainer

    CodeEditorScreen ..> CodeEditor
    CodeEditorScreen ..> EditorToolbar
    CodeEditorScreen ..> ScreenContainer

    CodeEditor ..> CodeMirrorWebView

    SubmissionResultScreen ..> VerdictBadge
    SubmissionResultScreen ..> TestCaseResult
    SubmissionResultScreen ..> CommitStatusBadge
    SubmissionResultScreen ..> ScreenContainer

    AIChatScreen ..> ChatBubble
    AIChatScreen ..> ChatInput
    AIChatScreen ..> ScreenContainer

    ProfileScreen ..> StatisticsCard
    ProfileScreen ..> StreakCalendar
    ProfileScreen ..> GitHubCard
    ProfileScreen ..> ScreenContainer

    SettingsScreen ..> GitHubConnectButton
    SettingsScreen ..> ScreenContainer

    WrongAnswersScreen ..> WrongAnswerCard
    WrongAnswersScreen ..> ScreenContainer

    LoginScreen ..> KakaoButton
    LoginScreen ..> GoogleButton
    LoginScreen ..> ScreenContainer

    ProblemCard ..> Button
    SearchBar ..> Input
    ChatInput ..> Input
    ChatInput ..> Button
```

---

## 3. Integration Points

### 3.1 Backend-Frontend Communication

```mermaid
classDiagram
    class BackendAPI {
        <<interface>>
        +/api/auth/*
        +/api/problems/*
        +/api/submissions/*
        +/api/ai/*
        +/api/github/*
        +/api/users/*
    }

    class FrontendRepositories {
        <<interface>>
        +IProblemRepository
        +ISubmissionRepository
        +IUserRepository
        +IAIRepository
        +IGitHubRepository
    }

    class ApiClient {
        +baseURL: string
        +timeout: number
        +headers: Headers
        +interceptors: Interceptors
    }

    FrontendRepositories --> ApiClient
    ApiClient --> BackendAPI
```

### 3.2 Data Flow Between Layers

```mermaid
classDiagram
    class UILayer {
        <<layer>>
        Screens
        Components
    }

    class BusinessLogicLayer {
        <<layer>>
        Hooks
        Services
    }

    class StateManagementLayer {
        <<layer>>
        Stores
    }

    class DataAccessLayer {
        <<layer>>
        Repositories
        ApiClient
    }

    class BackendLayer {
        <<layer>>
        Controllers
        Services
        Repositories
        Database
    }

    UILayer --> BusinessLogicLayer
    BusinessLogicLayer --> StateManagementLayer
    BusinessLogicLayer --> DataAccessLayer
    StateManagementLayer --> DataAccessLayer
    DataAccessLayer --> BackendLayer
```

---

## 4. Design Patterns Applied

### 4.1 Backend Patterns

1. **Layered Architecture** (Controller → Service → Repository)
2. **Repository Pattern** (Data access abstraction)
3. **Dependency Injection** (Service instantiation in controllers)
4. **Middleware Chain** (Auth, Validation, Error handling)
5. **Service Layer Pattern** (Business logic separation)

### 4.2 Frontend Patterns

1. **Repository Pattern** (API abstraction via interfaces)
2. **Service Layer Pattern** (Domain logic in services)
3. **Custom Hooks Pattern** (Reusable business logic)
4. **State Management Pattern** (Zustand stores)
5. **Composition Pattern** (Component composition)
6. **Observer Pattern** (Store subscriptions)
7. **Dependency Inversion Principle** (Depend on interfaces, not implementations)

---

## 5. SOLID Principles

### Backend

- **SRP**: Each class has single responsibility (Controller handles HTTP, Service handles logic, Repository handles data)
- **OCP**: Services can be extended without modification
- **LSP**: Repository implementations can substitute interfaces
- **ISP**: Focused interfaces for each module
- **DIP**: Controllers depend on Service interfaces, Services depend on Repository interfaces

### Frontend

- **SRP**: Screens (UI), Hooks (orchestration), Services (logic), Stores (state), Repositories (data)
- **OCP**: Plugin system for extensibility
- **LSP**: Repository implementations substitute interfaces
- **ISP**: Segregated repository interfaces
- **DIP**: Stores depend on Repository interfaces, not concrete implementations

---

**Last Updated**: 2025-12-04
**Version**: 1.0.0
