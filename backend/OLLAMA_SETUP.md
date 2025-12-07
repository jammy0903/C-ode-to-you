# Ollama 설치 가이드

AI 챗봇과 코드 리뷰 기능을 사용하려면 Ollama를 설치해야 합니다.

## 현재 상황

WSL2 환경에서 Docker가 활성화되지 않아 Docker Compose를 사용할 수 없습니다.

## 옵션 1: Ollama 직접 설치 (추천)

가장 빠르고 간단한 방법입니다.

### 1. Ollama 설치

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

sudo 비밀번호를 입력하라는 메시지가 표시됩니다.

### 2. Ollama 서비스 시작

```bash
ollama serve
```

또는 백그라운드에서 실행:

```bash
nohup ollama serve > /dev/null 2>&1 &
```

### 3. Kanana Nano 모델 다운로드

새 터미널 창에서:

```bash
ollama pull huihui_ai/kanana-nano-abliterated
```

모델 크기: 약 1.3GB (다운로드 시간: 네트워크 속도에 따라 다름)

### 4. 설치 확인

```bash
# Ollama가 실행 중인지 확인
curl http://localhost:11434/api/tags

# 모델 목록 확인
ollama list
```

### 5. 서버 재시작

백엔드 서버를 다시 시작하면 AI 기능을 사용할 수 있습니다:

```bash
npm run dev
```

---

## 옵션 2: Docker Desktop 사용

### 1. Docker Desktop에서 WSL 통합 활성화

1. Windows에서 Docker Desktop 실행
2. Settings > Resources > WSL Integration
3. "Enable integration with my default WSL distro" 체크
4. 사용 중인 WSL2 배포판 선택 후 "Apply & Restart"

### 2. Docker 설치 확인

WSL2 터미널에서:

```bash
docker --version
docker-compose --version
```

### 3. Ollama 시작 및 모델 다운로드

```bash
cd /home/jammy/projects/GAME/backend
./scripts/setup-ollama.sh
```

---

## 테스트

AI API가 작동하는지 확인:

```bash
# 1. Ollama health check
curl http://localhost:11434/api/tags

# 2. 백엔드 서버가 실행 중인지 확인
curl http://localhost:3000/health

# 3. AI 챗봇 테스트 (인증 토큰 필요)
curl -X POST http://localhost:3000/api/ai/chat/[problem-id] \
  -H "Authorization: Bearer [your-token]" \
  -H "Content-Type: application/json" \
  -d '{"message": "이 문제를 어떻게 풀어야 하나요?"}'
```

---

## 문제 해결

### Ollama가 응답하지 않음

```bash
# Ollama 프로세스 확인
ps aux | grep ollama

# Ollama 재시작
pkill ollama
ollama serve
```

### 모델을 찾을 수 없음

```bash
# 설치된 모델 확인
ollama list

# 모델 재다운로드
ollama pull huihui_ai/kanana-nano-abliterated
```

### 포트 11434가 이미 사용 중

```bash
# 포트 사용 중인 프로세스 확인
lsof -i :11434

# 해당 프로세스 종료
kill -9 [PID]
```

---

## .env 설정

`.env` 파일에 이미 Ollama URL이 설정되어 있습니다:

```bash
OLLAMA_BASE_URL=http://localhost:11434
```

Docker Compose를 사용하는 경우 (컨테이너 내부에서):

```bash
OLLAMA_BASE_URL=http://ollama:11434
```

---

## 추가 정보

- Ollama 공식 문서: https://ollama.com
- Kanana 모델 정보: https://github.com/kakao/kanana
- AI 기능은 **C 언어와 프로그래밍 질문만 답변**하도록 설정되어 있습니다
