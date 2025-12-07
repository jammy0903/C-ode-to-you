# System Architecture & Project Structure

## Architecture Overview

```mermaid
graph TB
    subgraph "Mobile Client"
        UI[React Native UI]
        State[State Management]
        API_Client[API Client]
    end

    subgraph "Backend API"
        Gateway[API Gateway]
        Auth[Auth Service]
        Problems[Problems Service]
        Submissions[Submissions Service]
        AI[AI Service]
        GitHub[GitHub Service]
    end

    subgraph "External Services"
        Kakao[Kakao OAuth]
        Google[Google OAuth]
        AIModel[AI Model<br/>Qwen2.5/StarCoder2]
        GitHubAPI[GitHub API]
        Baekjoon[Baekjoon API]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL/Supabase)]
        Cache[(Redis Cache)]
    end

    UI --> State
    State --> API_Client
    API_Client --> Gateway

    Gateway --> Auth
    Gateway --> Problems
    Gateway --> Submissions
    Gateway --> AI
    Gateway --> GitHub

    Auth --> Kakao
    Auth --> Google
    AI --> AIModel
    GitHub --> GitHubAPI
    Submissions --> Baekjoon

    Auth --> DB
    Problems --> DB
    Submissions --> DB
    AI --> DB
    GitHub --> DB

    Problems --> Cache
    AI --> Cache
```

---

## Technology Stack Details

### Frontend (Mobile)
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **State Management**: Zustand or Redux Toolkit
- **API Client**: Axios with interceptors
- **Code Editor**: react-native-webview + CodeMirror
- **UI Library**: React Native Paper or NativeBase

### Backend
- **Framework**: Node.js + Express
- **Language**: TypeScript
- **ORM**: Prisma or TypeORM
- **Validation**: Zod
- **Authentication**: JWT + Passport.js
- **File Upload**: Multer (if needed)

### Database
- **Primary**: PostgreSQL (via Supabase)
- **Cache**: Redis (optional for performance)

### AI Integration
- **Model**: Qwen2.5-Coder or StarCoder2-Korean
- **API**: REST or gRPC to AI model endpoint

---

## Project Folder Structure

```
GAME/
├── docs/                           # Documentation
│   ├── api-spec.md
│   ├── architecture.md             # This file
│   ├── database-schema.md
│   ├── flowchart.md
│   └── use-cases.md
│
├── backend/                        # Node.js Backend
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   ├── jwt.ts
│   │   │   └── env.ts
│   │   │
│   │   ├── middleware/            # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   │
│   │   ├── modules/               # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.types.ts
│   │   │   │   └── auth.validation.ts
│   │   │   │
│   │   │   ├── problems/
│   │   │   │   ├── problems.controller.ts
│   │   │   │   ├── problems.service.ts
│   │   │   │   ├── problems.routes.ts
│   │   │   │   ├── problems.types.ts
│   │   │   │   └── problems.validation.ts
│   │   │   │
│   │   │   ├── submissions/
│   │   │   │   ├── submissions.controller.ts
│   │   │   │   ├── submissions.service.ts
│   │   │   │   ├── submissions.routes.ts
│   │   │   │   ├── submissions.types.ts
│   │   │   │   ├── judge.service.ts        # Code judging logic
│   │   │   │   └── submissions.validation.ts
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   ├── ai.controller.ts
│   │   │   │   ├── ai.service.ts
│   │   │   │   ├── ai.routes.ts
│   │   │   │   ├── ai.types.ts
│   │   │   │   ├── ai-client.ts            # AI model client
│   │   │   │   └── ai.validation.ts
│   │   │   │
│   │   │   ├── github/
│   │   │   │   ├── github.controller.ts
│   │   │   │   ├── github.service.ts
│   │   │   │   ├── github.routes.ts
│   │   │   │   ├── github.types.ts
│   │   │   │   ├── github-client.ts        # GitHub API client
│   │   │   │   └── github.validation.ts
│   │   │   │
│   │   │   └── users/
│   │   │       ├── users.controller.ts
│   │   │       ├── users.service.ts
│   │   │       ├── users.routes.ts
│   │   │       ├── users.types.ts
│   │   │       └── users.validation.ts
│   │   │
│   │   ├── database/              # Database layer
│   │   │   ├── models/            # Database models (if using TypeORM)
│   │   │   ├── repositories/      # Repository pattern
│   │   │   │   ├── user.repository.ts
│   │   │   │   ├── problem.repository.ts
│   │   │   │   ├── submission.repository.ts
│   │   │   │   └── chat.repository.ts
│   │   │   ├── migrations/        # Database migrations
│   │   │   └── seeds/             # Seed data
│   │   │
│   │   ├── utils/                 # Utility functions
│   │   │   ├── logger.ts
│   │   │   ├── response.ts        # Standardized API responses
│   │   │   ├── crypto.ts          # Encryption utilities
│   │   │   └── date.ts
│   │   │
│   │   ├── types/                 # Shared TypeScript types
│   │   │   ├── express.d.ts
│   │   │   ├── api.types.ts
│   │   │   └── common.types.ts
│   │   │
│   │   ├── app.ts                 # Express app setup
│   │   └── server.ts              # Server entry point
│   │
│   ├── tests/                     # Backend tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── prisma/                    # Prisma ORM (if using)
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/                      # React Native App
│   ├── src/
│   │   ├── app/                   # App entry & navigation
│   │   │   ├── App.tsx
│   │   │   ├── navigation/
│   │   │   │   ├── RootNavigator.tsx
│   │   │   │   ├── AuthNavigator.tsx
│   │   │   │   └── MainNavigator.tsx
│   │   │   └── providers/
│   │   │       ├── AuthProvider.tsx
│   │   │       └── ThemeProvider.tsx
│   │   │
│   │   ├── features/              # Feature-based modules
│   │   │   ├── auth/
│   │   │   │   ├── screens/
│   │   │   │   │   └── LoginScreen.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── KakaoButton.tsx
│   │   │   │   │   └── GoogleButton.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useAuth.ts
│   │   │   │   └── store/
│   │   │   │       └── authStore.ts
│   │   │   │
│   │   │   ├── problems/
│   │   │   │   ├── screens/
│   │   │   │   │   ├── ProblemListScreen.tsx
│   │   │   │   │   └── ProblemDetailScreen.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── ProblemCard.tsx
│   │   │   │   │   ├── ProblemFilter.tsx
│   │   │   │   │   ├── SearchBar.tsx
│   │   │   │   │   └── FunctionRecommendations.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useProblems.ts
│   │   │   │   │   └── useProblemDetail.ts
│   │   │   │   └── store/
│   │   │   │       └── problemStore.ts
│   │   │   │
│   │   │   ├── editor/
│   │   │   │   ├── components/
│   │   │   │   │   ├── CodeEditor.tsx
│   │   │   │   │   ├── EditorToolbar.tsx
│   │   │   │   │   └── CodeMirrorWebView.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useCodeEditor.ts
│   │   │   │   │   └── useAutoSave.ts
│   │   │   │   └── store/
│   │   │   │       └── editorStore.ts
│   │   │   │
│   │   │   ├── ai-chat/
│   │   │   │   ├── screens/
│   │   │   │   │   └── AIChatScreen.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── ChatBubble.tsx
│   │   │   │   │   ├── ChatInput.tsx
│   │   │   │   │   └── FloatingChatButton.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useAIChat.ts
│   │   │   │   └── store/
│   │   │   │       └── chatStore.ts
│   │   │   │
│   │   │   ├── submissions/
│   │   │   │   ├── screens/
│   │   │   │   │   ├── SubmissionResultScreen.tsx
│   │   │   │   │   └── HistoryScreen.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── SubmissionCard.tsx
│   │   │   │   │   ├── TestCaseResult.tsx
│   │   │   │   │   └── VerdictBadge.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useSubmission.ts
│   │   │   │   │   └── useSubmissionStatus.ts
│   │   │   │   └── store/
│   │   │   │       └── submissionStore.ts
│   │   │   │
│   │   │   ├── wrong-answers/
│   │   │   │   ├── screens/
│   │   │   │   │   └── WrongAnswersScreen.tsx
│   │   │   │   ├── components/
│   │   │   │   │   └── WrongAnswerCard.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useWrongAnswers.ts
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   ├── screens/
│   │   │   │   │   ├── ProfileScreen.tsx
│   │   │   │   │   └── SettingsScreen.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── StatisticsCard.tsx
│   │   │   │   │   ├── GitHubCard.tsx
│   │   │   │   │   └── StreakCalendar.tsx
│   │   │   │   └── hooks/
│   │   │   │       ├── useUserStats.ts
│   │   │   │       └── useGitHub.ts
│   │   │   │
│   │   │   └── github/
│   │   │       ├── components/
│   │   │       │   ├── GitHubConnectButton.tsx
│   │   │       │   └── CommitStatusBadge.tsx
│   │   │       └── hooks/
│   │   │           └── useGitHubIntegration.ts
│   │   │
│   │   ├── shared/                # Shared resources
│   │   │   ├── api/               # API client
│   │   │   │   ├── client.ts
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.api.ts
│   │   │   │   │   ├── problems.api.ts
│   │   │   │   │   ├── submissions.api.ts
│   │   │   │   │   ├── ai.api.ts
│   │   │   │   │   ├── github.api.ts
│   │   │   │   │   └── users.api.ts
│   │   │   │   └── interceptors/
│   │   │   │       ├── auth.interceptor.ts
│   │   │   │       └── error.interceptor.ts
│   │   │   │
│   │   │   ├── components/        # Shared components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   │
│   │   │   ├── hooks/             # Shared hooks
│   │   │   │   ├── useAsync.ts
│   │   │   │   ├── useDebounce.ts
│   │   │   │   └── useKeyboard.ts
│   │   │   │
│   │   │   ├── utils/             # Utility functions
│   │   │   │   ├── storage.ts
│   │   │   │   ├── date.ts
│   │   │   │   └── validation.ts
│   │   │   │
│   │   │   ├── constants/         # Constants
│   │   │   │   ├── colors.ts
│   │   │   │   ├── routes.ts
│   │   │   │   └── config.ts
│   │   │   │
│   │   │   └── types/             # TypeScript types
│   │   │       ├── api.types.ts
│   │   │       ├── navigation.types.ts
│   │   │       └── common.types.ts
│   │   │
│   │   └── assets/                # Static assets
│   │       ├── images/
│   │       ├── icons/
│   │       └── fonts/
│   │
│   ├── tests/                     # Frontend tests
│   │   ├── unit/
│   │   └── integration/
│   │
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── shared/                        # Shared code (optional)
│   └── types/                     # Types shared between frontend & backend
│       └── api.types.ts
│
├── .gitignore
├── claude.md                      # This project guide for AI
└── README.md                      # Project README
```

---

## Backend Module Structure

Each backend module follows this pattern:

### Example: `modules/problems/`

```
problems/
├── problems.controller.ts    # HTTP request handlers
├── problems.service.ts       # Business logic
├── problems.routes.ts        # Route definitions
├── problems.types.ts         # Module-specific types
└── problems.validation.ts    # Request validation schemas
```

### Responsibilities:

#### **Controller** (`problems.controller.ts`)
- Handle HTTP requests/responses
- Call service methods
- Return formatted responses

```typescript
export class ProblemsController {
  async getProblemList(req: Request, res: Response) { }
  async getProblemDetail(req: Request, res: Response) { }
  async searchProblems(req: Request, res: Response) { }
  async getRecommendedFunctions(req: Request, res: Response) { }
}
```

#### **Service** (`problems.service.ts`)
- Business logic
- Data validation
- Call repositories
- External API integration

```typescript
export class ProblemsService {
  async findProblems(filters: ProblemFilters): Promise<ProblemList> { }
  async findProblemById(id: string): Promise<Problem> { }
  async searchProblems(query: string): Promise<Problem[]> { }
  async getRecommendedFunctions(problemId: string): Promise<FunctionRecommendations> { }
}
```

#### **Repository** (`database/repositories/problem.repository.ts`)
- Database queries
- CRUD operations
- Data mapping

```typescript
export class ProblemRepository {
  async findAll(options: QueryOptions): Promise<Problem[]> { }
  async findById(id: string): Promise<Problem | null> { }
  async search(query: string): Promise<Problem[]> { }
  async count(filters: ProblemFilters): Promise<number> { }
}
```

---

## Frontend Feature Structure

Each frontend feature follows Feature-Sliced Design principles:

### Example: `features/problems/`

```
problems/
├── screens/                  # Screen components
│   ├── ProblemListScreen.tsx
│   └── ProblemDetailScreen.tsx
├── components/               # Feature-specific components
│   ├── ProblemCard.tsx
│   └── FunctionRecommendations.tsx
├── hooks/                    # Custom hooks
│   ├── useProblems.ts
│   └── useProblemDetail.ts
└── store/                    # State management
    └── problemStore.ts
```

### Example Hook: `useProblems.ts`

```typescript
export const useProblems = (filters?: ProblemFilters) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProblems = async () => { };
  const searchProblems = async (query: string) => { };

  return { problems, loading, error, fetchProblems, searchProblems };
};
```

---

## Data Flow

### Frontend → Backend → Database

```mermaid
sequenceDiagram
    participant UI as UI Component
    participant Hook as Custom Hook
    participant API as API Client
    participant Controller as Controller
    participant Service as Service
    participant Repo as Repository
    participant DB as Database

    UI->>Hook: User action
    Hook->>API: API call
    API->>Controller: HTTP request
    Controller->>Service: Business logic
    Service->>Repo: Data operation
    Repo->>DB: SQL query
    DB-->>Repo: Query result
    Repo-->>Service: Mapped data
    Service-->>Controller: Processed data
    Controller-->>API: HTTP response
    API-->>Hook: Parsed response
    Hook-->>UI: Update state
```

---

## Key Design Patterns

### 1. **Repository Pattern** (Backend)
- Abstracts database operations
- Makes testing easier
- Allows switching databases

### 2. **Service Layer** (Backend)
- Encapsulates business logic
- Reusable across controllers
- Testable independently

### 3. **Feature-Sliced Design** (Frontend)
- Organizes code by features
- Clear boundaries between features
- Shared code in `shared/`

### 4. **Custom Hooks** (Frontend)
- Reusable stateful logic
- Separates UI from business logic
- Easy to test

---

## Environment Variables

### Backend `.env`
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# OAuth
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

# AI Model
AI_API_URL=http://localhost:8000
AI_API_KEY=your-ai-api-key

# GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Baekjoon API (if available)
BAEKJOON_API_URL=https://api.baekjoon.com
BAEKJOON_API_KEY=your-api-key
```

### Frontend `.env`
```env
# API
API_URL=http://localhost:3000/api

# OAuth Redirect URLs
KAKAO_REDIRECT_URI=myapp://auth/kakao
GOOGLE_REDIRECT_URI=myapp://auth/google
```

---

## Next Steps

1. ✅ Use cases defined
2. ✅ API specification completed
3. ✅ Architecture & folder structure designed
4. ⏳ Choose architecture pattern (FSD confirmed)
5. ⏳ Database schema design
6. ⏳ Implementation

---

*This architecture provides a scalable, maintainable structure for the C Language Learning App.*
