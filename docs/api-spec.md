# API Specification

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.your-domain.com/api
```

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Common Error Codes
| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INTERNAL_ERROR` | 500 | Server error |

---

## API Endpoints

## 1. Authentication

### 1.1. Kakao Login
```http
POST /api/auth/kakao
```

**Request Body:**
```json
{
  "code": "kakao_oauth_code"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": "user_uuid",
      "email": "user@kakao.com",
      "name": "홍길동",
      "provider": "kakao",
      "createdAt": "2025-12-03T00:00:00Z"
    }
  }
}
```

---

### 1.2. Google Login
```http
POST /api/auth/google
```

**Request Body:**
```json
{
  "code": "google_oauth_code"
}
```

**Response:** Same as Kakao Login

---

### 1.3. Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token"
  }
}
```

---

### 1.4. Logout
```http
POST /api/auth/logout
```
🔒 **Authentication Required**

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Problems

### 2.1. Get Problem List
```http
GET /api/problems
```
🔒 **Authentication Required**

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `tags` | string | - | Comma-separated tags: `array,string` |
| `difficulty` | string | - | Filter: 백준 난이도 등급. 예: `bronze_5`,`bronze_4`,`bronze_3`,`bronze_2`,`bronze_1`,`silver_5` … `ruby_1` (콤마로 여러 개 지정 가능: `silver_3,gold_5`) |
| `status` | string | - | Filter: `unsolved`, `attempted`, `solved` |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "problems": [
      {
        "id": "problem_uuid",
        "number": 1000,
        "title": "A+B",
        "difficulty": "silver_5",
        "tags": ["math", "implementation"],
        "acceptedCount": 500000,
        "submissionCount": 1000000,
        "userStatus": "solved",
        "userAttempts": 2,
        "lastAttemptAt": "2025-12-02T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 50,
      "totalItems": 1000,
      "itemsPerPage": 20
    }
  }
}
```

---

### 2.2. Search Problems
```http
GET /api/problems/search
```
🔒 **Authentication Required**

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (number or title) |

**Example:**
```
GET /api/problems/search?q=1000
GET /api/problems/search?q=Hello World
```

**Response:** Same as Get Problem List

---

### 2.3. Get Problem Detail
```http
GET /api/problems/:problemId
```
🔒 **Authentication Required**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "problem_uuid",
    "number": 1000,
    "title": "A+B",
    "description": "두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.",
    "inputFormat": "첫째 줄에 A와 B가 주어진다. (0 < A, B < 10)",
    "outputFormat": "첫째 줄에 A+B를 출력한다.",
    "difficulty": "silver_5",
    "tags": ["math", "implementation"],
    "timeLimit": 2000,
    "memoryLimit": 128,
    "examples": [
      {
        "input": "1 2",
        "output": "3"
      }
    ],
    "recommendedFunctions": [
      {
        "category": "input_output",
        "functions": ["scanf", "printf"]
      },
      {
        "category": "math",
        "functions": ["basic arithmetic operators"]
      }
    ],
    "userStats": {
      "attempts": 2,
      "status": "solved",
      "lastAttemptAt": "2025-12-02T10:00:00Z"
    }
  }
}
```

---

### 2.4. Get Recommended Functions for Problem
```http
GET /api/problems/:problemId/functions
```
🔒 **Authentication Required**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "approaches": [
      {
        "name": "Array-based Solution",
        "description": "배열을 사용한 풀이",
        "functions": [
          {
            "name": "int array[]",
            "header": "built-in",
            "description": "정수 배열 선언",
            "example": "int arr[100];"
          }
        ]
      },
      {
        "name": "Standard Library",
        "description": "표준 라이브러리 함수 사용",
        "functions": [
          {
            "name": "scanf",
            "header": "stdio.h",
            "description": "표준 입력으로부터 데이터 읽기",
            "example": "scanf(\"%d\", &num);"
          },
          {
            "name": "printf",
            "header": "stdio.h",
            "description": "표준 출력으로 데이터 출력",
            "example": "printf(\"%d\\n\", result);"
          }
        ]
      }
    ]
  }
}
```

---

### 2.5. Get Problem Statistics
```http
GET /api/problems/stats
```
🔒 **Authentication Required**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalProblems": 1000,
    "solvedByUser": 45,
    "attemptedByUser": 12,
    "unsolvedByUser": 943
  }
}
```

---

## 3. Submissions

### 3.1. Submit Code
```http
POST /api/submissions/:problemId/submit
```
🔒 **Authentication Required**

**Request Body:**
```json
{
  "code": "#include <stdio.h>\n\nint main() {\n  int a, b;\n  scanf(\"%d %d\", &a, &b);\n  printf(\"%d\\n\", a + b);\n  return 0;\n}",
  "language": "c"
}
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "submissionId": "submission_uuid",
    "status": "judging",
    "message": "Your code is being judged..."
  }
}
```

---

### 3.2. Get Submission Status
```http
GET /api/submissions/:submissionId/status
```
🔒 **Authentication Required**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "submissionId": "submission_uuid",
    "problemId": "problem_uuid",
    "status": "accepted",
    "result": {
      "verdict": "accepted",
      "executionTime": 120,
      "memoryUsage": 2048,
      "testCases": [
        {
          "number": 1,
          "status": "passed",
          "executionTime": 40
        },
        {
          "number": 2,
          "status": "passed",
          "executionTime": 80
        }
      ]
    },
    "code": "...",
    "language": "c",
    "submittedAt": "2025-12-03T10:00:00Z",
    "judgedAt": "2025-12-03T10:00:05Z"
  }
}
```

**Possible Verdict Values:**
- `judging`: Still being judged
- `accepted`: Correct answer
- `wrong_answer`: Wrong output
- `time_limit_exceeded`: Too slow
- `memory_limit_exceeded`: Too much memory
- `runtime_error`: Program crashed
- `compile_error`: Compilation failed

---

### 3.3. Get My Last Submission
```http
GET /api/submissions/:problemId/my-last
```
🔒 **Authentication Required**

**Response:** `200 OK` (same as Get Submission Status)

---

### 3.4. Get All My Attempts for Problem
```http
GET /api/submissions/:problemId/attempts
```
🔒 **Authentication Required**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "submissionId": "submission_uuid",
        "verdict": "wrong_answer",
        "submittedAt": "2025-12-01T10:00:00Z"
      },
      {
        "submissionId": "submission_uuid_2",
        "verdict": "accepted",
        "submittedAt": "2025-12-02T10:00:00Z"
      }
    ],
    "totalAttempts": 2
  }
}
```

---

### 3.5. Save Draft Code
```http
POST /api/submissions/:problemId/draft
```
🔒 **Authentication Required**

**Request Body:**
```json
{
  "code": "#include <stdio.h>\n\nint main() {\n  // Work in progress...\n  return 0;\n}"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Draft saved"
}
```

---

### 3.6. Get Draft Code
```http
GET /api/submissions/:problemId/draft
```
🔒 **Authentication Required**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "code": "#include <stdio.h>\n\nint main() {\n  // Work in progress...\n  return 0;\n}",
    "savedAt": "2025-12-03T09:50:00Z"
  }
}
```

---

### 3.7. Get Wrong Answer List
```http
GET /api/submissions/wrong
```
🔒 **Authentication Required**

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `sortBy` | string | `date` | Sort: `date`, `attempts`, `difficulty` |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "problems": [
      {
        "problemId": "problem_uuid",
        "number": 1001,
        "title": "A-B",
        "difficulty": "silver_5",
        "lastVerdict": "wrong_answer",
        "attempts": 3,
        "lastAttemptAt": "2025-12-02T15:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 12
    }
  }
}
```

---

### 3.8. Get Submission History
```http
GET /api/submissions/history
```
🔒 **Authentication Required**

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "submissionId": "submission_uuid",
        "problemNumber": 1000,
        "problemTitle": "A+B",
        "verdict": "accepted",
        "executionTime": 120,
        "submittedAt": "2025-12-03T10:00:00Z",
        "githubCommitUrl": "https://github.com/user/repo/commit/abc123"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200
    }
  }
}
```

---

## 4. AI Assistance

> **AI Provider**: Anthropic Claude API (BYOK - Bring Your Own Key)
>
> Users must register their own Anthropic API key via `PUT /api/users/me/settings`.
> The key is encrypted (AES-256-GCM) and stored in the database.
> A server-level fallback key can be configured via `AI_API_KEY` environment variable.

### 4.1. Validate API Key
```http
POST /api/ai/validate-key
```
🔒 **Authentication Required**

**Request Body:**
```json
{
  "apiKey": "sk-ant-api03-..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

---

### 4.3. Get Chat History
```http
GET /api/ai/chat/:problemId/history
```
🔒 **Authentication Required**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "conversationId": "conversation_uuid",
    "messages": [
      {
        "role": "assistant",
        "content": "Hi! I'm your coding mentor. Ask me anything about this problem or C language!",
        "timestamp": "2025-12-03T10:00:00Z"
      },
      {
        "role": "user",
        "content": "How do I use scanf?",
        "timestamp": "2025-12-03T10:01:00Z"
      },
      {
        "role": "assistant",
        "content": "scanf()는 표준 입력으로부터 데이터를 읽는 함수입니다...",
        "timestamp": "2025-12-03T10:01:05Z"
      }
    ]
  }
}
```

---

### 4.4. Send Chat Message
```http
POST /api/ai/chat/:problemId
```
🔒 **Authentication Required**

**Request Body:**
```json
{
  "message": "Give me a hint for this problem",
  "code": "#include <stdio.h>\n\nint main() {\n  // my code\n  return 0;\n}",
  "conversationId": "conversation_uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "conversationId": "conversation_uuid",
    "response": "이 문제는 두 숫자를 입력받아 더하는 간단한 문제입니다...\n\n1) **개념**: 입출력 함수 사용\n2) **접근 방법**: scanf로 두 정수 읽기 → 덧셈 → printf로 출력\n3) **코드 예시**:\n```c\nint a, b;\nscanf(\"%d %d\", &a, &b);\nprintf(\"%d\\n\", a + b);\n```\n4) **사용된 함수**:\n- `scanf`: stdio.h - 입력 받기\n- `printf`: stdio.h - 출력하기",
    "timestamp": "2025-12-03T10:01:05Z"
  }
}
```

---

### 4.5. Request Code Review
```http
POST /api/ai/review/:problemId
```
🔒 **Authentication Required**

**Request Body:**
```json
{
  "code": "#include <stdio.h>\n\nint main() {\n  int a, b;\n  scanf(\"%d %d\", &a, &b);\n  printf(\"%d\", a + b);\n  return 0;\n}"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "review": {
      "summary": "코드가 거의 완벽합니다! 한 가지만 개선하면 좋겠어요.",
      "strengths": [
        "scanf로 입력을 정확하게 받았습니다",
        "덧셈 연산을 올바르게 수행했습니다"
      ],
      "issues": [
        {
          "severity": "minor",
          "line": 5,
          "message": "출력 끝에 줄바꿈(\\n)을 추가하는 것이 좋습니다",
          "suggestion": "printf(\"%d\\n\", a + b);"
        }
      ],
      "suggestions": [
        "변수 이름을 더 명확하게 지을 수 있습니다 (예: num1, num2)",
        "입력 범위 검증을 추가하면 더 안전합니다"
      ]
    }
  }
}
```

---

## 5. GitHub Integration

### 5.1. Connect GitHub
```http
POST /api/github/connect
```
🔒 **Authentication Required**

**Request Body:**
```json
{
  "code": "github_oauth_code"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "githubUsername": "username",
    "repositoryUrl": "https://github.com/username/baekjoon-solutions",
    "connectedAt": "2025-12-03T10:00:00Z"
  }
}
```

---

### 5.2. Get GitHub Connection Status
```http
GET /api/github/status
```
🔒 **Authentication Required**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "connected": true,
    "githubUsername": "username",
    "repositoryUrl": "https://github.com/username/baekjoon-solutions",
    "lastCommitAt": "2025-12-03T09:00:00Z"
  }
}
```

---

### 5.3. Commit Solution to GitHub
```http
POST /api/github/commit
```
🔒 **Authentication Required**

**Request Body:**
```json
{
  "submissionId": "submission_uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "commitUrl": "https://github.com/username/baekjoon-solutions/commit/abc123",
    "commitMessage": "Solved: [BOJ #1000] A+B",
    "committedAt": "2025-12-03T10:00:10Z"
  }
}
```

---

### 5.4. Disconnect GitHub
```http
DELETE /api/github/disconnect
```
🔒 **Authentication Required**

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "GitHub disconnected successfully"
}
```

---

## 6. User Profile & Statistics

### 6.1. Get User Statistics
```http
GET /api/users/me/stats
```
🔒 **Authentication Required**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalSolved": 45,
    "totalAttempts": 57,
    "successRate": 78.9,
    "byDifficulty": {
      "bronze": 20,
      "silver": 15,
      "gold": 8,
      "platinum": 2
    },
    "currentStreak": 7,
    "longestStreak": 15,
    "recentActivity": [
      {
        "date": "2025-12-03",
        "solved": 2,
        "attempted": 3
      },
      {
        "date": "2025-12-02",
        "solved": 1,
        "attempted": 1
      }
    ]
  }
}
```

---

### 6.2. Get User Activity
```http
GET /api/users/me/activity
```
🔒 **Authentication Required**

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | number | 7 | Number of days to fetch |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "activity": [
      {
        "date": "2025-12-03",
        "submissions": 3,
        "solved": 2,
        "problems": [1000, 1001]
      }
    ]
  }
}
```

---

### 6.3. Get User Settings
```http
GET /api/users/me/settings
```
🔒 **Authentication Required**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "editor": {
      "fontSize": 14,
      "theme": "dark",
      "tabSize": 2
    },
    "ai": {
      "hintLevel": "beginner",
      "apiKey": "sk-ant-api03...xxxx",
      "model": "claude-sonnet-4-5-20250929",
      "provider": "anthropic"
    },
    "github": {
      "autoCommit": true
    },
    "notifications": {
      "email": true,
      "push": false
    }
  }
}
```

---

### 6.4. Update User Settings
```http
PUT /api/users/me/settings
```
🔒 **Authentication Required**

**Request Body:**
```json
{
  "editor": {
    "fontSize": 16,
    "theme": "light"
  },
  "ai": {
    "hintLevel": "intermediate",
    "apiKey": "sk-ant-api03-your-key-here",
    "model": "claude-sonnet-4-5-20250929"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

---

## Rate Limiting

All endpoints are rate-limited:
- **General endpoints**: 100 requests per 15 minutes
- **AI endpoints**: 20 requests per 15 minutes
- **Submission endpoints**: 50 requests per 15 minutes

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

---

## Webhook Events (Future)

### Submission Completed
Triggered when a submission is judged.

```json
{
  "event": "submission.completed",
  "data": {
    "submissionId": "submission_uuid",
    "userId": "user_uuid",
    "problemId": "problem_uuid",
    "verdict": "accepted"
  }
}
```

---

## Client SDK

Install the SDK:
```bash
npm install @c-ode-to-you/sdk
```

### Usage

```typescript
import { CodToYouClient } from '@c-ode-to-you/sdk';

const client = new CodToYouClient({
  baseUrl: 'https://api.example.com',
  token: 'jwt-token-here',
});

// Problems
const problems = await client.problems.list({ difficulty: 'silver_5' });
const problem = await client.problems.get('problem-uuid');

// AI Chat
const response = await client.ai.chat('problem-id', {
  message: 'printf 함수 사용법 알려줘',
  code: '#include <stdio.h>\nint main() { ... }',
});

// Code Review
const review = await client.ai.review('problem-id', {
  code: '#include <stdio.h>\nint main() { return 0; }',
});

// Validate API Key
const { valid } = await client.ai.validateKey('sk-ant-api03-...');

// User Settings (set AI key)
await client.users.updateSettings({
  ai: { apiKey: 'sk-ant-api03-...', model: 'claude-sonnet-4-5-20250929' },
});

// Submissions
const submission = await client.submissions.submit('problem-id', {
  code: '#include <stdio.h>\nint main() { ... }',
});

// User Stats
const stats = await client.users.getStatistics();
```

---

*This API specification is based on the use cases defined in `use-cases.md`.*
