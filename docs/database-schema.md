# Database Schema Design

## Overview
This document defines the database schema for the C Language Learning App using PostgreSQL with Prisma ORM.

---

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ SUBMISSIONS : creates
    USERS ||--o{ AI_CONVERSATIONS : has
    USERS ||--o{ DRAFTS : saves
    USERS ||--o| GITHUB_CONNECTIONS : has
    USERS ||--o| USER_SETTINGS : has

    PROBLEMS ||--o{ SUBMISSIONS : receives
    PROBLEMS ||--o{ PROBLEM_FUNCTIONS : has
    PROBLEMS ||--o{ AI_CONVERSATIONS : about
    PROBLEMS ||--o{ DRAFTS : for

    SUBMISSIONS ||--o| GITHUB_COMMITS : triggers

    AI_CONVERSATIONS ||--o{ AI_MESSAGES : contains

    USERS {
        uuid id PK
        string email UK
        string name
        string provider
        string provider_id
        timestamp created_at
        timestamp updated_at
    }

    PROBLEMS {
        uuid id PK
        integer number UK
        string title
        text description
        string difficulty  -- Baekjoon tier: bronze_5 ~ ruby_1
        jsonb tags
        integer time_limit
        integer memory_limit
        jsonb examples
        integer accepted_count
        integer submission_count
        timestamp created_at
    }

    SUBMISSIONS {
        uuid id PK
        uuid user_id FK
        uuid problem_id FK
        text code
        string language
        string verdict
        integer execution_time
        integer memory_usage
        jsonb test_results
        timestamp submitted_at
        timestamp judged_at
    }

    AI_CONVERSATIONS {
        uuid id PK
        uuid user_id FK
        uuid problem_id FK
        timestamp created_at
        timestamp updated_at
    }

    AI_MESSAGES {
        uuid id PK
        uuid conversation_id FK
        string role
        text content
        timestamp created_at
    }

    GITHUB_CONNECTIONS {
        uuid id PK
        uuid user_id FK
        string github_username
        string access_token
        string repository_url
        timestamp connected_at
    }

    GITHUB_COMMITS {
        uuid id PK
        uuid submission_id FK
        string commit_sha
        string commit_url
        string commit_message
        timestamp committed_at
    }

    USER_SETTINGS {
        uuid id PK
        uuid user_id FK
        jsonb editor_settings
        jsonb ai_settings
        jsonb github_settings
        jsonb notification_settings
        timestamp updated_at
    }

    PROBLEM_FUNCTIONS {
        uuid id PK
        uuid problem_id FK
        string category
        string function_name
        string header_file
        text description
        text example
        integer display_order
    }

    DRAFTS {
        uuid id PK
        uuid user_id FK
        uuid problem_id FK
        text code
        timestamp saved_at
    }
```

---

## Table Definitions

### 1. Users Table

Stores user account information from OAuth providers.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('kakao', 'google')),
    provider_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(provider, provider_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
```

**Fields:**
- `id`: Unique user identifier
- `email`: User's email address
- `name`: User's display name
- `provider`: OAuth provider (`kakao` or `google`)
- `provider_id`: ID from OAuth provider
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

---

### 2. Problems Table

Stores coding problems (from Baekjoon or custom).

```sql
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INTEGER UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (
        difficulty ~ '^(bronze|silver|gold|platinum|diamond|ruby)_[1-5]$'
    ),
    tags JSONB NOT NULL DEFAULT '[]',
    time_limit INTEGER NOT NULL DEFAULT 2000,  -- in milliseconds
    memory_limit INTEGER NOT NULL DEFAULT 128, -- in MB
    examples JSONB NOT NULL DEFAULT '[]',
    accepted_count INTEGER DEFAULT 0,
    submission_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_problems_number ON problems(number);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_tags ON problems USING GIN(tags);
CREATE INDEX idx_problems_title ON problems USING GIN(to_tsvector('english', title));
```

**JSONB Fields:**

**tags** example:
```json
["array", "string", "math", "implementation"]
```

**examples** structure:
```json
[
  {
    "input": "1 2",
    "output": "3",
    "explanation": "1 + 2 = 3"
  }
]
```

---

### 3. Submissions Table

Stores code submissions and judge results.

```sql
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(20) NOT NULL DEFAULT 'c',
    verdict VARCHAR(30) NOT NULL CHECK (verdict IN (
        'judging',
        'accepted',
        'wrong_answer',
        'time_limit_exceeded',
        'memory_limit_exceeded',
        'runtime_error',
        'compile_error'
    )),
    execution_time INTEGER,  -- in milliseconds
    memory_usage INTEGER,    -- in KB
    test_results JSONB DEFAULT '[]',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    judged_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_submissions_verdict ON submissions(verdict);
CREATE INDEX idx_submissions_user_problem ON submissions(user_id, problem_id);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at DESC);
```

**test_results** structure:
```json
[
  {
    "number": 1,
    "status": "passed",
    "executionTime": 40,
    "input": "1 2",
    "expectedOutput": "3",
    "actualOutput": "3"
  },
  {
    "number": 2,
    "status": "failed",
    "executionTime": 50,
    "input": "5 7",
    "expectedOutput": "12",
    "actualOutput": "11"
  }
]
```

---

### 4. AI Conversations Table

Stores AI chat sessions per problem.

```sql
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, problem_id)
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_problem ON ai_conversations(problem_id);
```

---

### 5. AI Messages Table

Stores individual chat messages.

```sql
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at);
```

---

### 6. GitHub Connections Table

Stores GitHub OAuth tokens and repository info.

```sql
CREATE TABLE github_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    github_username VARCHAR(100) NOT NULL,
    access_token TEXT NOT NULL,
    repository_url VARCHAR(255) NOT NULL,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_github_connections_user ON github_connections(user_id);
```

**Security Note:** `access_token` should be encrypted at the application level before storage.

---

### 7. GitHub Commits Table

Tracks GitHub commits for submissions.

```sql
CREATE TABLE github_commits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    commit_sha VARCHAR(40) NOT NULL,
    commit_url VARCHAR(500) NOT NULL,
    commit_message TEXT NOT NULL,
    committed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(submission_id)
);

CREATE INDEX idx_github_commits_submission ON github_commits(submission_id);
CREATE INDEX idx_github_commits_committed_at ON github_commits(committed_at DESC);
```

---

### 8. User Settings Table

Stores user preferences and settings.

```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    editor_settings JSONB NOT NULL DEFAULT '{}',
    ai_settings JSONB NOT NULL DEFAULT '{}',
    github_settings JSONB NOT NULL DEFAULT '{}',
    notification_settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);
```

**Default JSONB values:**

```json
{
  "editor_settings": {
    "fontSize": 14,
    "theme": "dark",
    "tabSize": 2,
    "autoSave": true,
    "autoSaveInterval": 30
  },
  "ai_settings": {
    "hintLevel": "beginner",
    "language": "ko"
  },
  "github_settings": {
    "autoCommit": true,
    "commitOnAccepted": true,
    "commitOnWrong": true
  },
  "notification_settings": {
    "email": true,
    "push": false
  }
}
```

---

### 9. Problem Functions Table

Stores recommended C functions for each problem.

```sql
CREATE TABLE problem_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    function_name VARCHAR(100) NOT NULL,
    header_file VARCHAR(50),
    description TEXT NOT NULL,
    example TEXT,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_problem_functions_problem ON problem_functions(problem_id);
CREATE INDEX idx_problem_functions_display_order ON problem_functions(problem_id, display_order);
```

**Example data:**
```sql
INSERT INTO problem_functions (problem_id, category, function_name, header_file, description, example, display_order)
VALUES
(
    'problem-uuid',
    'input_output',
    'scanf',
    'stdio.h',
    '표준 입력으로부터 데이터를 읽어옵니다.',
    'int a, b;\nscanf("%d %d", &a, &b);',
    1
),
(
    'problem-uuid',
    'input_output',
    'printf',
    'stdio.h',
    '표준 출력으로 데이터를 출력합니다.',
    'printf("%d\\n", result);',
    2
);
```

---

### 10. Drafts Table

Stores auto-saved draft code.

```sql
CREATE TABLE drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, problem_id)
);

CREATE INDEX idx_drafts_user_problem ON drafts(user_id, problem_id);
```

---

## Views for Common Queries

### User Problem Statistics View

```sql
CREATE VIEW user_problem_stats AS
SELECT
    u.id as user_id,
    COUNT(DISTINCT s.problem_id) FILTER (WHERE s.verdict = 'accepted') as solved_count,
    COUNT(DISTINCT s.problem_id) FILTER (WHERE s.verdict != 'accepted') as attempted_count,
    COUNT(*) as total_submissions,
    ROUND(
        (COUNT(*) FILTER (WHERE s.verdict = 'accepted')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
        2
    ) as success_rate
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id
GROUP BY u.id;
```

### User Problem Status View

```sql
CREATE VIEW user_problem_status AS
SELECT
    u.id as user_id,
    p.id as problem_id,
    p.number,
    p.title,
    p.difficulty,
    CASE
        WHEN COUNT(s.id) FILTER (WHERE s.verdict = 'accepted') > 0 THEN 'solved'
        WHEN COUNT(s.id) > 0 THEN 'attempted'
        ELSE 'unsolved'
    END as status,
    COUNT(s.id) as attempts,
    MAX(s.submitted_at) as last_attempt_at
FROM users u
CROSS JOIN problems p
LEFT JOIN submissions s ON u.id = s.user_id AND p.id = s.problem_id
GROUP BY u.id, p.id, p.number, p.title, p.difficulty;
```

### Wrong Answer Problems View

```sql
CREATE VIEW wrong_answer_problems AS
SELECT
    s.user_id,
    p.id as problem_id,
    p.number,
    p.title,
    p.difficulty,
    MAX(s.verdict) as last_verdict,
    COUNT(s.id) as attempts,
    MAX(s.submitted_at) as last_attempt_at
FROM submissions s
JOIN problems p ON s.problem_id = p.id
WHERE s.verdict != 'accepted'
  AND NOT EXISTS (
      SELECT 1 FROM submissions s2
      WHERE s2.user_id = s.user_id
        AND s2.problem_id = s.problem_id
        AND s2.verdict = 'accepted'
  )
GROUP BY s.user_id, p.id, p.number, p.title, p.difficulty;
```

---

## Prisma Schema

Here's the equivalent Prisma schema file:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id         String   @id @default(uuid()) @db.Uuid
  email      String   @unique
  name       String
  provider   Provider
  providerId String   @map("provider_id")
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz

  submissions       Submission[]
  conversations     AiConversation[]
  drafts            Draft[]
  githubConnection  GithubConnection?
  settings          UserSettings?

  @@unique([provider, providerId])
  @@map("users")
}

enum Provider {
  kakao
  google
}

model Problem {
  id              String     @id @default(uuid()) @db.Uuid
  number          Int        @unique
  title           String
  description     String     @db.Text
  inputFormat     String     @map("input_format") @db.Text
  outputFormat    String     @map("output_format") @db.Text
  difficulty      String     @db.VarChar(20) // Baekjoon tier: bronze_5 ~ ruby_1
  tags            Json       @default("[]")
  timeLimit       Int        @default(2000) @map("time_limit")
  memoryLimit     Int        @default(128) @map("memory_limit")
  examples        Json       @default("[]")
  acceptedCount   Int        @default(0) @map("accepted_count")
  submissionCount Int        @default(0) @map("submission_count")
  createdAt       DateTime   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime   @updatedAt @map("updated_at") @db.Timestamptz

  submissions       Submission[]
  functions         ProblemFunction[]
  conversations     AiConversation[]
  drafts            Draft[]

  @@map("problems")
}

model Submission {
  id            String    @id @default(uuid()) @db.Uuid
  userId        String    @map("user_id") @db.Uuid
  problemId     String    @map("problem_id") @db.Uuid
  code          String    @db.Text
  language      String    @default("c")
  verdict       Verdict
  executionTime Int?      @map("execution_time")
  memoryUsage   Int?      @map("memory_usage")
  testResults   Json      @default("[]") @map("test_results")
  submittedAt   DateTime  @default(now()) @map("submitted_at") @db.Timestamptz
  judgedAt      DateTime? @map("judged_at") @db.Timestamptz

  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  problem       Problem         @relation(fields: [problemId], references: [id], onDelete: Cascade)
  githubCommit  GithubCommit?

  @@index([userId])
  @@index([problemId])
  @@index([userId, problemId])
  @@map("submissions")
}

enum Verdict {
  judging
  accepted
  wrong_answer
  time_limit_exceeded
  memory_limit_exceeded
  runtime_error
  compile_error
}

model AiConversation {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  problemId String   @map("problem_id") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz

  user     User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  problem  Problem     @relation(fields: [problemId], references: [id], onDelete: Cascade)
  messages AiMessage[]

  @@unique([userId, problemId])
  @@map("ai_conversations")
}

model AiMessage {
  id             String   @id @default(uuid()) @db.Uuid
  conversationId String   @map("conversation_id") @db.Uuid
  role           Role
  content        String   @db.Text
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz

  conversation AiConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@map("ai_messages")
}

enum Role {
  user
  assistant
}

model GithubConnection {
  id             String   @id @default(uuid()) @db.Uuid
  userId         String   @unique @map("user_id") @db.Uuid
  githubUsername String   @map("github_username")
  accessToken    String   @map("access_token") @db.Text
  repositoryUrl  String   @map("repository_url")
  connectedAt    DateTime @default(now()) @map("connected_at") @db.Timestamptz
  updatedAt      DateTime @updatedAt @map("updated_at") @db.Timestamptz

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("github_connections")
}

model GithubCommit {
  id            String   @id @default(uuid()) @db.Uuid
  submissionId  String   @unique @map("submission_id") @db.Uuid
  commitSha     String   @map("commit_sha")
  commitUrl     String   @map("commit_url")
  commitMessage String   @map("commit_message") @db.Text
  committedAt   DateTime @default(now()) @map("committed_at") @db.Timestamptz

  submission Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  @@map("github_commits")
}

model UserSettings {
  id                     String   @id @default(uuid()) @db.Uuid
  userId                 String   @unique @map("user_id") @db.Uuid
  editorSettings         Json     @default("{}") @map("editor_settings")
  aiSettings             Json     @default("{}") @map("ai_settings")
  githubSettings         Json     @default("{}") @map("github_settings")
  notificationSettings   Json     @default("{}") @map("notification_settings")
  createdAt              DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt              DateTime @updatedAt @map("updated_at") @db.Timestamptz

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}

model ProblemFunction {
  id           String  @id @default(uuid()) @db.Uuid
  problemId    String  @map("problem_id") @db.Uuid
  category     String
  functionName String  @map("function_name")
  headerFile   String? @map("header_file")
  description  String  @db.Text
  example      String? @db.Text
  displayOrder Int     @default(0) @map("display_order")

  problem Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)

  @@map("problem_functions")
}

model Draft {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  problemId String   @map("problem_id") @db.Uuid
  code      String   @db.Text
  savedAt   DateTime @default(now()) @map("saved_at") @db.Timestamptz

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  problem Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)

  @@unique([userId, problemId])
  @@map("drafts")
}
```

---

## Sample Data

### Seed Problems

```sql
-- Problem 1000: A+B
INSERT INTO problems (number, title, description, input_format, output_format, difficulty, tags, examples)
VALUES (
    1000,
    'A+B',
    '두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.',
    '첫째 줄에 A와 B가 주어진다. (0 < A, B < 10)',
    '첫째 줄에 A+B를 출력한다.',
    'silver_5',
    '["math", "implementation"]',
    '[{"input": "1 2", "output": "3"}]'
);

-- Functions for Problem 1000
INSERT INTO problem_functions (problem_id, category, function_name, header_file, description, example, display_order)
SELECT
    id,
    'input_output',
    'scanf',
    'stdio.h',
    '표준 입력으로부터 데이터를 읽어옵니다.',
    'int a, b;\nscanf("%d %d", &a, &b);',
    1
FROM problems WHERE number = 1000;

INSERT INTO problem_functions (problem_id, category, function_name, header_file, description, example, display_order)
SELECT
    id,
    'input_output',
    'printf',
    'stdio.h',
    '표준 출력으로 데이터를 출력합니다.',
    'printf("%d\n", result);',
    2
FROM problems WHERE number = 1000;
```

---

## Database Indexes Strategy

### Performance Optimization

1. **User Lookups**: Index on `email` and `provider + provider_id`
2. **Problem Searches**: Full-text index on `title`, GIN index on `tags`
3. **Submission Queries**: Composite index on `(user_id, problem_id)`
4. **Timeline Queries**: Index on timestamps (DESC for recent-first)
5. **GitHub Integration**: Index on `user_id` for quick lookups

---

## Backup & Maintenance

### Recommended Backup Strategy
- **Full backup**: Daily at 2 AM
- **Incremental backup**: Every 6 hours
- **Retention**: 30 days

### Maintenance Tasks
- **VACUUM**: Weekly to reclaim storage
- **ANALYZE**: After bulk inserts to update statistics
- **REINDEX**: Monthly on heavily updated tables

---

*This schema supports all use cases defined in `use-cases.md` and APIs in `api-spec.md`.*
