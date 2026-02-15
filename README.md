# C-ode to you

백준(BOJ) 문제 기반 C 언어 학습을 위한 **REST API 서비스** + **클라이언트 SDK**.

AI(Claude)가 힌트, 코드 리뷰, 함수 설명을 제공하여 C 언어 초보자의 학습을 돕는다.

## 구조

```
C-ode-to-you/
├── backend/          # REST API 서비스 (Express + TypeScript)
├── sdk/              # 클라이언트 SDK (TypeScript, npm 패키지)
└── docs/             # API 명세 및 설계 문서
```

## 주요 기능

- **문제 탐색** - 백준 문제 목록 조회, 난이도/태그별 필터링
- **코드 제출 및 채점** - C 코드 제출, 자동 채점, 결과 확인
- **AI 힌트/채팅** - 문제별 AI 채팅으로 힌트 및 C 함수 사용법 안내
- **AI 코드 리뷰** - 제출 코드에 대한 구조화된 리뷰 (장점, 이슈, 제안)
- **코드 초안 자동저장** - 작성 중인 코드 자동 저장/복원
- **사용자 통계** - 풀이 현황, 연속 풀이 기록, 난이도별 통계
- **GitHub 연동** - 풀이한 코드를 GitHub 리포지토리에 자동 커밋

## 기술 스택

| 영역 | 기술 |
|------|------|
| API 서버 | Node.js + Express + TypeScript |
| 데이터베이스 | PostgreSQL 16 |
| ORM | Prisma |
| 인증 | Google/Kakao OAuth + JWT |
| AI | Anthropic Claude API (BYOK) |
| 검증 | Zod |
| 인프라 | Docker Compose (PostgreSQL) |
| SDK | TypeScript (fetch 기반) |

## 시작하기

### 사전 요구사항

- Node.js 18+
- Docker (PostgreSQL 실행용)

### 1. 저장소 클론

```bash
git clone https://github.com/your-repo/C-ode-to-you.git
cd C-ode-to-you
```

### 2. 백엔드 설정

```bash
cd backend
npm install
cp .env.example .env
# .env 파일에 필요한 값 입력 (DB, JWT, OAuth, ENCRYPTION_KEY 등)
```

### 3. 데이터베이스 실행

```bash
docker compose up -d postgres
```

### 4. DB 마이그레이션

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed    # 샘플 데이터 (선택)
```

### 5. 서버 실행

```bash
npm run dev
# http://localhost:3000 에서 실행
```

### 6. SDK 빌드 (선택)

```bash
cd ../sdk
npm install
npm run build
```

## AI 설정 (BYOK)

이 서비스는 **Anthropic Claude API**를 사용한다.
사용자가 자신의 Anthropic API 키를 등록하는 BYOK(Bring Your Own Key) 방식이다.

> Claude Max 구독(claude.ai)과 Anthropic API는 별개 상품이다.
> API 키는 [console.anthropic.com](https://console.anthropic.com)에서 발급받는다.

**키 등록 방법:**

```bash
# 1. API 키 유효성 검증
curl -X POST http://localhost:3000/api/ai/validate-key \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "sk-ant-api03-..."}'

# 2. 사용자 설정에 키 등록
curl -X PUT http://localhost:3000/api/users/me/settings \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"ai": {"apiKey": "sk-ant-api03-...", "model": "claude-sonnet-4-5-20250929"}}'
```

API 키는 AES-256-GCM으로 암호화되어 DB에 저장되며, 조회 시 마스킹(`sk-ant-api03...xxxx`)된다.

서버 관리자는 `.env`의 `AI_API_KEY`에 폴백 키를 설정할 수 있다 (사용자 키 미등록 시 사용).

## 환경변수

| 변수 | 설명 | 필수 |
|------|------|:----:|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | O |
| `JWT_SECRET` | JWT 서명 키 (32자 이상) | O |
| `REFRESH_TOKEN_SECRET` | 리프레시 토큰 키 (32자 이상) | O |
| `ENCRYPTION_KEY` | API 키 암호화 마스터 키 (16자 이상) | O |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID | O |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 시크릿 | O |
| `KAKAO_CLIENT_ID` | Kakao OAuth 클라이언트 ID | O |
| `GITHUB_CLIENT_ID` | GitHub OAuth 클라이언트 ID | O |
| `AI_API_KEY` | 서버 폴백용 Anthropic API 키 | - |
| `AI_MODEL_NAME` | 기본 AI 모델 (default: `claude-sonnet-4-5-20250929`) | - |
| `CORS_ORIGIN` | 허용 Origin (쉼표 구분) | O |

전체 목록은 `backend/.env.example` 참조.

## API 엔드포인트 (32개)

| 카테고리 | 메서드 | 경로 | 설명 |
|----------|--------|------|------|
| **Auth** | POST | `/api/auth/google` | Google 로그인 |
| | POST | `/api/auth/kakao` | Kakao 로그인 |
| | POST | `/api/auth/refresh` | 토큰 갱신 |
| | POST | `/api/auth/logout` | 로그아웃 |
| | GET | `/api/auth/me` | 현재 사용자 |
| **Problems** | GET | `/api/problems` | 문제 목록 (필터링/페이징) |
| | GET | `/api/problems/:id` | 문제 상세 |
| | GET | `/api/problems/search` | 문제 검색 |
| | GET | `/api/problems/tags` | 태그 목록 |
| | GET | `/api/problems/:id/functions` | 관련 C 함수 |
| **Submissions** | POST | `/api/submissions/:problemId/submit` | 코드 제출 |
| | GET | `/api/submissions/:id/status` | 채점 결과 |
| | GET | `/api/submissions/:problemId/attempts` | 제출 이력 |
| | GET | `/api/submissions/:problemId/draft` | 초안 조회 |
| | POST | `/api/submissions/:problemId/draft` | 초안 저장 |
| | GET | `/api/submissions/history` | 전체 제출 이력 |
| **AI** | POST | `/api/ai/validate-key` | API 키 검증 |
| | GET | `/api/ai/chat/:problemId/history` | 채팅 히스토리 |
| | POST | `/api/ai/chat/:problemId` | AI 채팅 |
| | POST | `/api/ai/review/:problemId` | 코드 리뷰 |
| **Users** | GET | `/api/users/me/stats` | 풀이 통계 |
| | GET | `/api/users/me/activity` | 활동 기록 |
| | GET | `/api/users/me/settings` | 설정 조회 |
| | PUT | `/api/users/me/settings` | 설정 변경 |
| **GitHub** | GET | `/api/github/status` | 연결 상태 |
| | GET | `/api/github/connect` | GitHub 연결 |
| | DELETE | `/api/github/disconnect` | 연결 해제 |
| | GET | `/api/github/commits` | 커밋 이력 |

상세 명세: [`docs/api-spec.md`](./docs/api-spec.md)

## SDK 사용법

```typescript
import { CodToYouClient } from '@c-ode-to-you/sdk';

const client = new CodToYouClient({
  baseUrl: 'https://api.example.com',
  token: 'jwt-token',
});

// 문제 목록
const { items, pagination } = await client.problems.list({
  difficulty: 'silver_5',
  page: 1,
});

// AI 채팅
const response = await client.ai.chat('problem-uuid', {
  message: 'printf 함수 사용법 알려줘',
  code: '#include <stdio.h>\nint main() { ... }',
});

// 코드 리뷰
const { review } = await client.ai.review('problem-uuid', {
  code: '#include <stdio.h>\nint main() { return 0; }',
});

// 코드 제출
const submission = await client.submissions.submit('problem-uuid', {
  code: '#include <stdio.h>\nint main() { ... }',
});

// 사용자 통계
const stats = await client.users.getStatistics();

// AI 키 설정
await client.users.updateSettings({
  ai: { apiKey: 'sk-ant-api03-...', model: 'claude-sonnet-4-5-20250929' },
});
```

## 프로젝트 구조

### 백엔드 (`backend/`)

```
backend/src/
├── config/              # 환경변수, DB 설정
├── middleware/           # 인증, 검증, 에러 처리, 레이트 리밋
├── modules/
│   ├── auth/            # Google/Kakao OAuth + JWT
│   ├── problems/        # 문제 CRUD
│   ├── submissions/     # 제출, 채점
│   ├── ai/              # Claude API 연동, 채팅, 코드 리뷰
│   ├── users/           # 통계, 설정
│   └── github/          # GitHub 연동
├── database/
│   └── repositories/    # Repository 패턴 (Prisma)
├── utils/               # 응답 헬퍼, 로거, 암호화
└── types/               # 공통 타입
```

**아키텍처**: `Controller -> Service -> Repository -> Prisma`

### SDK (`sdk/`)

```
sdk/src/
├── client.ts            # CodToYouClient (진입점)
├── types.ts             # 공개 타입 정의
├── modules/             # API 모듈 (auth, problems, submissions, ai, users, github)
└── utils/               # HTTP 클라이언트, 에러 타입
```

## 데이터베이스

PostgreSQL 16, 10개 테이블:

- `users` - 사용자 (Google/Kakao OAuth)
- `problems` - 백준 문제
- `problem_functions` - 문제별 C 함수 정보
- `submissions` - 코드 제출 및 채점 결과
- `ai_conversations` - AI 채팅 대화
- `ai_messages` - 채팅 메시지
- `github_connections` - GitHub 계정 연결
- `github_commits` - GitHub 커밋 기록
- `user_settings` - 사용자 설정 (JSONB, AI 키 포함)
- `drafts` - 코드 초안

스키마: [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma)

## 라이선스

MIT
