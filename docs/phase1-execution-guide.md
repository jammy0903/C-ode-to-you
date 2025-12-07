# Phase 1: 인프라 구축 실행 가이드

## ✅ 완료된 작업

### 1. SolvedacService 생성 ✅
- **파일**: `/backend/src/modules/problems/solvedac.service.ts`
- **기능**: solved.ac API 클라이언트 (문제 검색, 상세 조회)
- **타입**: `/backend/src/modules/problems/solvedac.types.ts`

### 2. RateLimiter 유틸리티 ✅
- **파일**: `/backend/src/utils/rate-limiter.ts`
- **기능**: API Rate Limit 관리 (15분당 256회)
- **용도**: 크롤링 시 API 제한 준수

### 3. 크롤링 스크립트 ✅
- **파일**: `/backend/scripts/crawl-solvedac-problems.ts`
- **목표**: Bronze 5 ~ Silver 3 문제 640개 수집
- **기능**: 자동 중복 체크, Rate Limiter 사용, 진행 상황 로깅

### 4. Prisma 스키마 업데이트 ✅
- **파일**: `/backend/prisma/schema.prisma`
- **추가 필드**:
  - `solvedacLevel`: Int? (solved.ac 레벨 1-30)
  - `baekjoonUrl`: String? (백준 문제 URL)
  - `@@index([solvedacLevel])`: 레벨별 검색 인덱스

---

## 🚀 실행 단계

### Step 1: Migration 실행

```bash
cd /home/jammy/projects/GAME/backend

# Migration 생성 및 적용
npx prisma migrate dev --name add_solvedac_fields

# Prisma Client 재생성
npx prisma generate
```

**예상 결과**:
```
✔ Applying migration `20251204_add_solvedac_fields`
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

### Step 2: 데이터베이스 확인

```bash
# Prisma Studio 실행
npx prisma studio

# 또는 SQL로 직접 확인
psql -U postgres -d c_learning_db -c "\d problems"
```

**확인 사항**:
- `solvedac_level` 컬럼 존재
- `baekjoonUrl` 컬럼 존재
- `solvedac_level` 인덱스 생성

### Step 3: 크롤링 실행

```bash
cd /home/jammy/projects/GAME/backend

# TypeScript 실행
npx tsx scripts/crawl-solvedac-problems.ts
```

**예상 출력**:
```
🚀 Starting problem crawling from solved.ac...

📥 Crawling tier: B5
──────────────────────────────────────────────────
  📄 Page 1/2: 40 problems found
    ✅ #1000: A+B
    ✅ #1001: A-B
    ...
  ✨ Tier B5 completed: 78 added, 2 skipped

📥 Crawling tier: B4
──────────────────────────────────────────────────
  📄 Page 1/2: 40 problems found
  ...

🎉 Crawling completed!
══════════════════════════════════════════════════
📊 Statistics:
  ✅ Total added: 523 problems
  ⏭️  Total skipped: 3 problems
  ❌ Total errors: 0 problems
  📈 Success rate: 100.0%

⏱️  Rate Limiter Stats:
  Requests in window: 215/256
  Utilization: 84.0%
  Remaining: 41 requests
```

### Step 4: 결과 확인

```bash
# Prisma Studio로 확인
npx prisma studio

# 또는 SQL 쿼리
psql -U postgres -d c_learning_db << 'EOF'
-- 전체 문제 수
SELECT COUNT(*) as total_problems FROM problems;

-- 난이도별 문제 수
SELECT difficulty, COUNT(*) as count
FROM problems
GROUP BY difficulty
ORDER BY difficulty;

-- solved.ac 데이터가 있는 문제
SELECT COUNT(*) as with_solvedac
FROM problems
WHERE solvedac_level IS NOT NULL;

-- 최근 추가된 문제 10개
SELECT number, title, difficulty, solvedac_level, baekjoon_url
FROM problems
ORDER BY created_at DESC
LIMIT 10;
EOF
```

**예상 결과**:
```
 total_problems
----------------
            526

 difficulty | count
------------+-------
 bronze_1   |    78
 bronze_2   |    79
 bronze_3   |    77
 bronze_4   |    80
 bronze_5   |    80
 silver_1   |    34
 silver_2   |    50
 silver_3   |    48

 with_solvedac
---------------
           523
```

---

## 🔧 문제 해결

### Migration 실패 시

**문제**: `Prisma Migrate has detected that the environment is non-interactive`

**해결**:
```bash
# 1. Migration 파일만 생성
npx prisma migrate dev --create-only --name add_solvedac_fields

# 2. SQL 직접 실행
psql -U postgres -d c_learning_db << 'EOF'
ALTER TABLE problems ADD COLUMN solvedac_level INTEGER;
ALTER TABLE problems ADD COLUMN baekjoon_url TEXT;
CREATE INDEX idx_problems_solvedac_level ON problems(solvedac_level);
EOF

# 3. Migration 적용 표시
npx prisma migrate resolve --applied add_solvedac_fields

# 4. Prisma Client 재생성
npx prisma generate
```

### 크롤링 실패 시

**문제**: `ECONNREFUSED` 또는 `ETIMEDOUT`

**해결**:
```bash
# 1. 네트워크 확인
curl https://solved.ac/api/v3/problem/show?problemId=1000

# 2. 재시도 (자동 Rate Limiter 적용)
npx tsx scripts/crawl-solvedac-problems.ts
```

**문제**: Rate Limit 초과

**해결**:
- 15분 대기 후 재실행
- 스크립트는 자동으로 대기하므로 중단하지 말 것
- `RateLimiter Stats` 확인하여 진행 상황 체크

### 중복 문제 발생 시

**문제**: 일부 문제가 이미 존재

**해결**:
- 스크립트가 자동으로 스킵함 (⏭️  already exists)
- 강제 재크롤링이 필요한 경우:
  ```sql
  DELETE FROM problems WHERE solvedac_level IS NOT NULL;
  ```

---

## 📊 검증 체크리스트

- [ ] Migration 성공 (solvedacLevel, baekjoonUrl 컬럼 생성)
- [ ] Prisma Client 재생성 완료
- [ ] 크롤링 실행 시작
- [ ] 크롤링 완료 (500개 이상 문제 수집)
- [ ] DB에 문제 데이터 확인
- [ ] Prisma Studio에서 문제 목록 확인
- [ ] baekjoonUrl 필드 정상 입력 확인
- [ ] difficulty 필드 정상 변환 확인 (level → tier)

---

## 🎯 다음 단계 (Phase 2)

Phase 1이 완료되면 다음 작업을 진행합니다:

1. **JudgeService 제거**
2. **SubmissionService 리팩토링** (백준 제출 방식)
3. **프론트엔드 UI 변경** (백준 링크 연결)
4. **API 엔드포인트 추가** (결과 입력 API)

**시작 명령**:
```bash
# 다음 Phase는 별도로 시작하겠습니다
echo "Phase 1 완료! Phase 2를 시작하려면 알려주세요."
```

---

## 📝 로그 확인

크롤링 중 문제 발생 시 로그 확인:

```bash
# 백엔드 로그
tail -f /home/jammy/projects/GAME/backend/logs/combined.log

# 크롤링 출력을 파일로 저장
npx tsx scripts/crawl-solvedac-problems.ts 2>&1 | tee crawl.log
```

---

**실행 권장 시간**: 약 15-20분 (Rate Limiter 대기 시간 포함)
**예상 API 호출 수**: 약 200-250회 (제한 256회 이내)
