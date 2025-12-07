# solved.ac API 완벽 가이드 (2025년 기준)

## 📚 API 기본 정보

| 항목 | 내용 |
|------|------|
| **베이스 URL** | `https://solved.ac/api/v3` |
| **인증** | ❌ 불필요 (공개 API) |
| **Rate Limit** | ⏰ **15분당 256회** |
| **CORS** | ⚠️ 브라우저에서 직접 호출 불가 (백엔드에서 호출 필요) |
| **문서** | [비공식 커뮤니티 문서](https://solvedac.github.io/unofficial-documentation/) |

---

## 🎯 주요 엔드포인트

### 1. 문제 상세 조회
```http
GET https://solved.ac/api/v3/problem/show?problemId={problemId}
```

**응답 구조:**
```json
{
  "problemId": 1000,
  "titleKo": "A+B",
  "titles": [
    {"language": "ko", "title": "A+B"},
    {"language": "en", "title": "A+B"}
  ],
  "level": 1,              // 난이도 (1~30)
  "acceptedUserCount": 234567,
  "votedUserCount": 12345,
  "averageTries": 2.6,
  "isLevelLocked": false,
  "tags": [
    {
      "key": "implementation",
      "displayNames": [
        {"language": "ko", "name": "구현"}
      ],
      "aliases": ["구현"],
      "problemCount": 5678
    }
  ]
}
```

### 2. 문제 검색 (난이도 필터)
```http
GET https://solved.ac/api/v3/search/problem?query={query}&page={page}
```

**쿼리 문법:**
```
tier:b5           # Bronze 5 문제만
tier:b1..g5       # Bronze 1 ~ Gold 5
*b                # 모든 Bronze 문제
tag:implementation # 구현 태그 문제
solved:true       # 내가 푼 문제 (로그인 필요)
```

**응답 구조:**
```json
{
  "count": 184,      // 전체 결과 수
  "items": [         // 문제 배열 (페이지당 40개)
    {
      "problemId": 1000,
      "titleKo": "A+B",
      "level": 1,
      "tags": [...],
      "acceptedUserCount": 234567
    }
  ]
}
```

---

## 🎨 난이도 (Level) 체계

| Level | Tier | 설명 |
|-------|------|------|
| 0 | Unrated | 난이도 미정 |
| 1-5 | Bronze V~I | 브론즈 (초급) |
| 6-10 | Silver V~I | 실버 (초중급) |
| 11-15 | Gold V~I | 골드 (중급) |
| 16-20 | Platinum V~I | 플래티넘 (고급) |
| 21-25 | Diamond V~I | 다이아몬드 (최고급) |
| 26-30 | Ruby V~I | 루비 (초고급) |

**변환 함수:**
```typescript
function levelToTier(level: number): string {
  const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'ruby'];
  if (level === 0) return 'unrated';
  const tierIndex = Math.floor((level - 1) / 5);
  const subLevel = 5 - ((level - 1) % 5); // V, IV, III, II, I
  return `${tiers[tierIndex]}_${subLevel}`;
}

// 예: level 1 → "bronze_5"
// 예: level 6 → "silver_5"
```

---

## ⚠️ 주의사항

### 1. Rate Limit 준수
- 15분당 256회 제한
- 요청 간 최소 250ms 간격 권장 (4req/sec)
- 대량 크롤링 시 1초 간격 권장

### 2. CORS 이슈
- ❌ 프론트엔드에서 직접 호출 불가
- ✅ 백엔드 서버에서만 호출

### 3. 문제 설명 제한
- solved.ac API는 문제 본문 제공 안 함
- 제목, 난이도, 태그만 제공
- 실제 문제 내용은 Baekjoon 링크로 연결

### 4. 저작권
- solved.ac는 비공식 서비스
- 상업적 사용 시 제작자 승인 필요
- 교육 목적 사용 권장

---

## 🔗 참고 자료

- [solved.ac 비공식 API 문서](https://solvedac.github.io/unofficial-documentation/)
- [GitHub - solvedac/unofficial-documentation](https://github.com/solvedac/unofficial-documentation)
- [solved.ac 공식 사이트](https://solved.ac/)
- [Baekjoon Online Judge](https://www.acmicpc.net/)

---

## 📝 구현 예제

### TypeScript Service 클래스
```typescript
import axios from 'axios';

export class SolvedacService {
  private readonly BASE_URL = 'https://solved.ac/api/v3';

  async getProblem(problemId: number) {
    const response = await axios.get(`${this.BASE_URL}/problem/show`, {
      params: { problemId },
      timeout: 10000,
    });
    return response.data;
  }

  async searchProblems(query: string, page: number = 1) {
    const response = await axios.get(`${this.BASE_URL}/search/problem`, {
      params: { query, page },
      timeout: 10000,
    });
    return response.data;
  }
}
```

### Rate Limit 관리
```typescript
class RateLimiter {
  private requests: number[] = [];
  private readonly limit = 256;
  private readonly windowMs = 15 * 60 * 1000; // 15분

  async waitIfNeeded() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.limit) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}
```
