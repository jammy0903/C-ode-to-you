# Frontend Architecture & Flow Diagrams

## Overview

이 문서는 React Native 프론트엔드의 아키텍처, 데이터 플로우, 컴포넌트 계층 구조를 시각화합니다.

---

## 1. Frontend Architecture Overview

```mermaid
graph TB
    subgraph "UI Layer"
        Screens[Screen Components]
        Components[Feature Components]
        SharedUI[Shared Components]
    end

    subgraph "Business Logic Layer"
        Hooks[Custom Hooks]
        Services[Domain Services]
    end

    subgraph "State Management Layer"
        Stores[Zustand Stores]
        AsyncState[AsyncState Helpers]
    end

    subgraph "Data Access Layer"
        Repositories[Repositories]
        ApiClient[ApiClient]
    end

    subgraph "Infrastructure"
        AxiosClient[Axios Instance]
        Interceptors[Interceptors]
        Types[TypeScript Types]
    end

    Screens --> Components
    Components --> Hooks
    Hooks --> Stores
    Hooks --> Services
    Stores --> Repositories
    Services --> Repositories
    Repositories --> ApiClient
    ApiClient --> AxiosClient
    AxiosClient --> Interceptors
    Stores --> AsyncState

    style Screens fill:#00ffff,stroke:#00ffff,color:#000
    style Stores fill:#00ff00,stroke:#00ff00,color:#000
    style Repositories fill:#ff00ff,stroke:#ff00ff,color:#000
    style ApiClient fill:#ffff00,stroke:#ffff00,color:#000
```

---

## 2. Data Flow Diagram

```mermaid
sequenceDiagram
    participant UI as UI Component
    participant Hook as Custom Hook
    participant Store as Zustand Store
    participant Service as Domain Service
    participant Repo as Repository
    participant API as ApiClient
    participant Backend as Backend API

    UI->>Hook: User Action
    Hook->>Store: Update State (Loading)
    Hook->>Service: Call Business Logic
    Service->>Repo: Request Data
    Repo->>API: HTTP Request
    API->>Backend: API Call
    Backend-->>API: Response
    API-->>Repo: Unwrapped Data
    Repo-->>Service: Domain Object
    Service-->>Hook: Processed Result
    Hook->>Store: Update State (Success/Error)
    Store-->>UI: State Change
    UI->>UI: Re-render
```

---

## 3. Component Hierarchy

```mermaid
graph TD
    App[App.tsx] --> RootNav[RootNavigator]
    RootNav --> AuthNav[AuthNavigator]
    RootNav --> MainNav[MainNavigator]

    AuthNav --> LoginScreen[LoginScreen]
    LoginScreen --> KakaoBtn[KakaoButton]
    LoginScreen --> GoogleBtn[GoogleButton]

    MainNav --> ProblemsTab[Problems Tab]
    MainNav --> ProfileTab[Profile Tab]

    ProblemsTab --> ProblemListStack[Problems Stack]
    ProblemListStack --> ProblemList[ProblemListScreen]
    ProblemListStack --> ProblemDetail[ProblemDetailScreen]
    ProblemListStack --> CodeEditor[CodeEditorScreen]
    ProblemListStack --> SubmissionResult[SubmissionResultScreen]
    ProblemListStack --> AIChat[AIChatScreen]

    ProblemList --> ProblemCard[ProblemCard]
    ProblemList --> SearchBar[SearchBar]
    ProblemList --> ProblemFilter[ProblemFilter]

    ProblemDetail --> FloatingChatBtn[FloatingChatButton]

    CodeEditor --> EditorToolbar[EditorToolbar]
    CodeEditor --> CodeMirrorView[CodeMirrorWebView]

    SubmissionResult --> VerdictBadge[VerdictBadge]
    SubmissionResult --> TestCaseResult[TestCaseResult]

    AIChat --> ChatBubble[ChatBubble]
    AIChat --> ChatInput[ChatInput]

    ProfileTab --> ProfileScreen[ProfileScreen]
    ProfileScreen --> StatisticsCard[StatisticsCard]
    ProfileScreen --> StreakCalendar[StreakCalendar]

    style App fill:#0a0a0f,stroke:#00ffff,color:#00ffff
    style Screens fill:#0d1117,stroke:#00ff00,color:#00ff00
    style Components fill:#1a1a2e,stroke:#ff00ff,color:#ff00ff
```

---

## 4. State Management Flow

```mermaid
graph LR
    subgraph "Store Layer (Zustand)"
        StoreState[State Only]
        StoreActions[Pure Actions]
    end

    subgraph "Hook Layer"
        Hook[Custom Hook]
        BusinessLogic[Business Logic]
    end

    subgraph "Service Layer"
        DomainService[Domain Service]
        PollingService[Polling Service]
    end

    subgraph "Repository Layer"
        Repository[Repository Interface]
        ApiRepo[API Repository]
    end

    UI[UI Component] --> Hook
    Hook --> StoreState
    Hook --> BusinessLogic
    BusinessLogic --> DomainService
    DomainService --> Repository
    Repository --> ApiRepo
    StoreActions --> StoreState

    style StoreState fill:#00ffff,stroke:#00ffff,color:#000
    style Hook fill:#00ff00,stroke:#00ff00,color:#000
    style DomainService fill:#ff00ff,stroke:#ff00ff,color:#000
    style Repository fill:#ffff00,stroke:#ffff00,color:#000
```

---

## 5. Feature Module Structure (Example: Problems)

```mermaid
graph TD
    subgraph "features/problems/"
        ProblemScreen[ProblemListScreen.tsx]
        ProblemDetail[ProblemDetailScreen.tsx]
        
        ProblemCard[ProblemCard.tsx]
        SearchBar[SearchBar.tsx]
        ProblemFilter[ProblemFilter.tsx]
        
        UseProblems[useProblems.ts]
        UseProblemDetail[useProblemDetail.ts]
        
        ProblemStore[problemStore.ts]
    end

    subgraph "shared/"
        ApiClient[api/core/ApiClient.ts]
        ProblemsApi[api/endpoints/problems.api.ts]
        AsyncState[state/asyncState.ts]
        CreateAsync[state/createAsyncSlice.ts]
    end

    ProblemScreen --> UseProblems
    ProblemDetail --> UseProblemDetail
    UseProblems --> ProblemStore
    UseProblemDetail --> ProblemStore
    ProblemStore --> CreateAsync
    CreateAsync --> AsyncState
    ProblemStore --> ProblemsApi
    ProblemsApi --> ApiClient

    style ProblemScreen fill:#0d1117,stroke:#00ffff,color:#00ffff
    style ProblemStore fill:#1a1a2e,stroke:#00ff00,color:#00ff00
    style ApiClient fill:#2a2a2e,stroke:#ff00ff,color:#ff00ff
```

---

## 6. API Client Flow

```mermaid
graph TD
    Request[API Request] --> ApiClient[ApiClient]
    ApiClient --> AxiosInstance[Axios Instance]
    
    AxiosInstance --> RequestInterceptor[Request Interceptor]
    RequestInterceptor --> AddToken[Add JWT Token]
    AddToken --> Backend[Backend API]
    
    Backend --> ResponseInterceptor[Response Interceptor]
    ResponseInterceptor --> Check401{401 Error?}
    
    Check401 -->|Yes| RefreshToken[Refresh Token]
    Check401 -->|No| UnwrapResponse[Unwrap Response]
    
    RefreshToken --> QueueRequest[Queue Request]
    RefreshToken --> GetNewToken[Get New Token]
    GetNewToken --> RetryRequest[Retry Original Request]
    RetryRequest --> UnwrapResponse
    
    UnwrapResponse --> ValidateResponse{Valid?}
    ValidateResponse -->|Yes| ReturnData[Return Data]
    ValidateResponse -->|No| ThrowError[Throw ApiError]
    
    ReturnData --> Hook
    ThrowError --> Hook

    style ApiClient fill:#00ffff,stroke:#00ffff,color:#000
    style RefreshToken fill:#ff00ff,stroke:#ff00ff,color:#000
    style UnwrapResponse fill:#00ff00,stroke:#00ff00,color:#000
```

---

## 7. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginScreen
    participant AuthHook
    participant AuthStore
    participant AuthAPI
    participant Backend
    participant SecureStore

    User->>LoginScreen: Click Login Button
    LoginScreen->>AuthHook: loginWithKakao()
    AuthHook->>AuthStore: setLoading(true)
    AuthHook->>AuthAPI: loginWithKakao(code)
    AuthAPI->>Backend: POST /api/auth/kakao
    Backend-->>AuthAPI: { token, refreshToken, user }
    AuthAPI-->>AuthHook: AuthResponse
    AuthHook->>SecureStore: Save tokens
    AuthHook->>AuthStore: setUser(user)
    AuthStore-->>LoginScreen: isAuthenticated = true
    LoginScreen->>LoginScreen: Navigate to Main
```

---

## 8. Code Submission Flow

```mermaid
sequenceDiagram
    participant User
    participant CodeEditor
    participant EditorHook
    participant SubmissionHook
    participant SubmissionStore
    participant SubmissionAPI
    participant Backend
    participant PollingService

    User->>CodeEditor: Click Submit
    CodeEditor->>SubmissionHook: submitCode(code, language)
    SubmissionHook->>SubmissionStore: setSubmitting(true)
    SubmissionHook->>SubmissionAPI: submitCode(problemId, payload)
    SubmissionAPI->>Backend: POST /api/submissions/:id/submit
    Backend-->>SubmissionAPI: Submission (pending)
    SubmissionAPI-->>SubmissionHook: Submission
    SubmissionHook->>SubmissionStore: setCurrentSubmission(submission)
    SubmissionHook->>PollingService: startPolling(submissionId)
    
    loop Polling
        PollingService->>SubmissionAPI: getSubmissionStatus(id)
        SubmissionAPI->>Backend: GET /api/submissions/:id/status
        Backend-->>SubmissionAPI: Submission (judging/accepted/...)
        SubmissionAPI-->>PollingService: Updated Submission
        PollingService->>SubmissionStore: setCurrentSubmission(updated)
    end
    
    PollingService->>SubmissionStore: setSubmitting(false)
    SubmissionStore-->>CodeEditor: Navigate to Result
```

---

## 9. AI Chat Flow

```mermaid
sequenceDiagram
    participant User
    participant AIChatScreen
    participant ChatHook
    participant ChatStore
    participant AIAPI
    participant Backend
    participant AIModel

    User->>AIChatScreen: Type Message
    AIChatScreen->>ChatHook: sendMessage(content)
    ChatHook->>ChatStore: Optimistic Update (user message)
    ChatHook->>AIAPI: sendChatMessage(problemId, payload)
    AIAPI->>Backend: POST /api/ai/chat/:problemId
    Backend->>AIModel: Process Request
    AIModel-->>Backend: AI Response
    Backend-->>AIAPI: ChatMessage
    AIAPI-->>ChatHook: ChatMessage
    ChatHook->>ChatStore: Add AI message
    ChatStore-->>AIChatScreen: Update UI
```

---

## 10. Navigation Structure

```mermaid
graph TD
    Root[RootNavigator] --> AuthCheck{Authenticated?}
    
    AuthCheck -->|No| AuthStack[AuthNavigator]
    AuthCheck -->|Yes| MainStack[MainNavigator]
    
    AuthStack --> Login[LoginScreen]
    
    MainStack --> ProblemsTab[Problems Tab]
    MainStack --> ProfileTab[Profile Tab]
    
    ProblemsTab --> ProblemsStack[Problems Stack Navigator]
    ProblemsStack --> ProblemList[ProblemListScreen]
    ProblemsStack --> ProblemDetail[ProblemDetailScreen]
    ProblemsStack --> CodeEditor[CodeEditorScreen]
    ProblemsStack --> SubmissionResult[SubmissionResultScreen]
    ProblemsStack --> AIChat[AIChatScreen]
    
    ProfileTab --> Profile[ProfileScreen]
    Profile --> Settings[SettingsScreen]
    
    ProblemList -.->|Navigate| ProblemDetail
    ProblemDetail -.->|Navigate| CodeEditor
    CodeEditor -.->|Navigate| SubmissionResult
    ProblemDetail -.->|Navigate| AIChat

    style Root fill:#0a0a0f,stroke:#00ffff,color:#00ffff
    style ProblemsStack fill:#0d1117,stroke:#00ff00,color:#00ff00
    style Screens fill:#1a1a2e,stroke:#ff00ff,color:#ff00ff
```

---

## 11. Store State Structure

```mermaid
graph TD
    subgraph "ProblemStore"
        ProblemState[State]
        ProblemList[problems: Problem[]]
        ProblemPagination[pagination: PaginationMeta]
        ProblemFilters[filters: GetProblemsParams]
        ProblemLoading[isLoading: boolean]
        ProblemError[error: string | null]
    end

    subgraph "SubmissionStore"
        SubmissionState[State]
        CurrentSubmission[currentSubmission: Submission | null]
        SubmissionLoading[isSubmitting: boolean]
        SubmissionError[error: string | null]
        SubmissionHistory[history: Submission[]]
    end

    subgraph "AuthStore"
        AuthState[State]
        User[user: User | null]
        IsAuthenticated[isAuthenticated: boolean]
        AuthLoading[isLoading: boolean]
    end

    subgraph "ChatStore"
        ChatState[State]
        Messages[messages: ChatMessage[]]
        ChatLoading[isSending: boolean]
        ChatError[error: string | null]
    end

    ProblemState --> ProblemList
    ProblemState --> ProblemPagination
    ProblemState --> ProblemFilters
    ProblemState --> ProblemLoading
    ProblemState --> ProblemError

    SubmissionState --> CurrentSubmission
    SubmissionState --> SubmissionLoading
    SubmissionState --> SubmissionError
    SubmissionState --> SubmissionHistory

    AuthState --> User
    AuthState --> IsAuthenticated
    AuthState --> AuthLoading

    ChatState --> Messages
    ChatState --> ChatLoading
    ChatState --> ChatError

    style ProblemState fill:#00ffff,stroke:#00ffff,color:#000
    style SubmissionState fill:#00ff00,stroke:#00ff00,color:#000
    style AuthState fill:#ff00ff,stroke:#ff00ff,color:#000
    style ChatState fill:#ffff00,stroke:#ffff00,color:#000
```

---

## 12. Error Handling Flow

```mermaid
graph TD
    Error[Error Occurs] --> CheckType{Error Type?}
    
    CheckType -->|ApiError| ApiErrorHandler[ApiError Handler]
    CheckType -->|Network Error| NetworkErrorHandler[Network Error Handler]
    CheckType -->|Unknown Error| UnknownErrorHandler[Unknown Error Handler]
    
    ApiErrorHandler --> CheckStatusCode{Status Code?}
    CheckStatusCode -->|401| RefreshToken[Refresh Token]
    CheckStatusCode -->|403| ForbiddenError[Show Forbidden Message]
    CheckStatusCode -->|404| NotFoundError[Show Not Found Message]
    CheckStatusCode -->|500| ServerError[Show Server Error]
    CheckStatusCode -->|Other| ValidationError[Show Validation Error]
    
    RefreshToken --> TokenSuccess{Success?}
    TokenSuccess -->|Yes| RetryRequest[Retry Original Request]
    TokenSuccess -->|No| Logout[Logout User]
    
    NetworkErrorHandler --> ShowNetworkError[Show Network Error Message]
    UnknownErrorHandler --> ShowGenericError[Show Generic Error Message]
    
    RetryRequest --> UpdateStore[Update Store State]
    ForbiddenError --> UpdateStore
    NotFoundError --> UpdateStore
    ServerError --> UpdateStore
    ValidationError --> UpdateStore
    ShowNetworkError --> UpdateStore
    ShowGenericError --> UpdateStore
    
    UpdateStore --> UIUpdate[UI Updates with Error]

    style Error fill:#ff0000,stroke:#ff0000,color:#fff
    style RefreshToken fill:#ff00ff,stroke:#ff00ff,color:#000
    style UpdateStore fill:#00ffff,stroke:#00ffff,color:#000
```

---

## 13. Theme & Styling Architecture

```mermaid
graph TD
    subgraph "Theme System"
        TamaguiConfig[tamagui.config.ts]
        ThemeConstants[theme.ts]
        GlobalStyles[globalStyles.ts]
    end

    subgraph "Components"
        TamaguiComponents[Tamagui Components]
        CustomComponents[Custom Components]
    end

    subgraph "Providers"
        TamaguiProvider[TamaguiProvider]
        ThemeProvider[ThemeProvider]
    end

    App --> TamaguiProvider
    TamaguiProvider --> ThemeProvider
    ThemeProvider --> Screens
    
    TamaguiConfig --> TamaguiProvider
    ThemeConstants --> GlobalStyles
    GlobalStyles --> CustomComponents
    TamaguiComponents --> Screens
    CustomComponents --> Screens

    style TamaguiConfig fill:#00ffff,stroke:#00ffff,color:#000
    style ThemeConstants fill:#00ff00,stroke:#00ff00,color:#000
    style GlobalStyles fill:#ff00ff,stroke:#ff00ff,color:#000
```

---

## 14. File Structure Overview

```mermaid
graph TD
    Frontend[frontend/] --> Src[src/]
    
    Src --> App[app/]
    Src --> Features[features/]
    Src --> Shared[shared/]
    Src --> Assets[assets/]
    
    App --> Navigation[navigation/]
    App --> Providers[providers/]
    App --> AppTsx[App.tsx]
    
    Features --> Auth[auth/]
    Features --> Problems[problems/]
    Features --> Editor[editor/]
    Features --> Submissions[submissions/]
    Features --> AIChat[ai-chat/]
    Features --> Profile[profile/]
    
    Auth --> AuthScreens[screens/]
    Auth --> AuthComponents[components/]
    Auth --> AuthHooks[hooks/]
    Auth --> AuthStore[store/]
    
    Shared --> SharedAPI[api/]
    Shared --> SharedState[state/]
    Shared --> SharedComponents[components/]
    Shared --> SharedHooks[hooks/]
    Shared --> SharedUtils[utils/]
    Shared --> SharedTypes[types/]
    Shared --> SharedStyles[styles/]
    
    SharedAPI --> ApiCore[core/]
    SharedAPI --> ApiEndpoints[endpoints/]
    
    style Frontend fill:#0a0a0f,stroke:#00ffff,color:#00ffff
    style Features fill:#0d1117,stroke:#00ff00,color:#00ff00
    style Shared fill:#1a1a2e,stroke:#ff00ff,color:#ff00ff
```

---

## 15. SOLID Principles Application

```mermaid
graph TD
    subgraph "Single Responsibility Principle (SRP)"
        StoreResponsibility[Store: State Only]
        HookResponsibility[Hook: Business Logic]
        ServiceResponsibility[Service: Domain Logic]
        RepoResponsibility[Repository: Data Access]
    end

    subgraph "Open/Closed Principle (OCP)"
        PluginSystem[Plugin System]
        ExtensibleStore[Extensible Stores]
    end

    subgraph "Liskov Substitution Principle (LSP)"
        RepositoryInterface[Repository Interface]
        ApiRepository[API Repository]
        MockRepository[Mock Repository]
    end

    subgraph "Interface Segregation Principle (ISP)"
        IProblemRepo[IProblemRepository]
        ISubmissionRepo[ISubmissionRepository]
        IUserRepo[IUserRepository]
    end

    subgraph "Dependency Inversion Principle (DIP)"
        StoreDependsOnInterface[Store depends on Repository Interface]
        HookDependsOnService[Hook depends on Service Interface]
    end

    StoreResponsibility --> HookResponsibility
    HookResponsibility --> ServiceResponsibility
    ServiceResponsibility --> RepoResponsibility
    
    PluginSystem --> ExtensibleStore
    
    RepositoryInterface --> ApiRepository
    RepositoryInterface --> MockRepository
    
    IProblemRepo --> ApiRepository
    ISubmissionRepo --> ApiRepository
    IUserRepo --> ApiRepository
    
    StoreDependsOnInterface --> RepositoryInterface
    HookDependsOnService --> ServiceResponsibility

    style StoreResponsibility fill:#00ffff,stroke:#00ffff,color:#000
    style RepositoryInterface fill:#00ff00,stroke:#00ff00,color:#000
    style PluginSystem fill:#ff00ff,stroke:#ff00ff,color:#000
```

---

## Key Design Patterns Used

1. **Repository Pattern**: 데이터 접근 추상화
2. **Service Layer Pattern**: 비즈니스 로직 분리
3. **Custom Hooks Pattern**: 재사용 가능한 로직
4. **State Management Pattern**: Zustand를 통한 전역 상태
5. **Async State Pattern**: 일관된 비동기 상태 관리
6. **Error Boundary Pattern**: 에러 처리 및 복구

---

**Last Updated**: 2025-12-04
**Version**: 1.0.0

