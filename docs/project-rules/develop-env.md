# Development Environment Setup

## Overview

This document describes the development environment for the C-ode to you project.

**Architecture:**
- **Code**: WSL2 (Ubuntu)
- **Android Emulator**: Windows (Android Studio)
- **Connection**: Tunnel (Expo + ngrok)

```
┌─────────────────────────────────────────────────────────────┐
│                      Windows Host                            │
│  ┌─────────────────┐                                        │
│  │ Android Studio  │                                        │
│  │   Emulator      │◄──────── Expo Tunnel ─────────┐       │
│  │  (localhost)    │                               │       │
│  └─────────────────┘                               │       │
│                                                     │       │
│  ┌─────────────────────────────────────────────────┴───┐   │
│  │                    WSL2 (Ubuntu)                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │  Frontend   │  │   Backend   │  │   Ollama    │  │   │
│  │  │  (Metro)    │  │  (Express)  │  │    (AI)     │  │   │
│  │  │  :8081      │  │   :3000     │  │  :11434     │  │   │
│  │  └─────────────┘  └──────┬──────┘  └─────────────┘  │   │
│  │                          │                           │   │
│  │                    ngrok tunnel                      │   │
│  │                          ▼                           │   │
│  │              https://xxx.ngrok-free.dev              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Windows
- Android Studio with Android Emulator
- Platform Tools (`C:\Program Files\platform-tools\adb.exe`)

### WSL2 (Ubuntu)
- Node.js (via nvm)
- PostgreSQL
- Ollama (AI model server)
- ngrok (for backend tunnel)

---

## Step-by-Step Startup

### 1. Start PostgreSQL (WSL)

```bash
sudo -S service postgresql start
```

### 2. Start Ollama (WSL)

```bash
ollama serve &
# Or if already running, skip this step
```

### 3. Start Backend (WSL)

```bash
cd /home/jammy/projects/GAME/backend
npm run dev
```

Expected output:
```
🔍 Testing database connection...
✅ Database connected successfully
🚀 Server running on port 3000
```

### 4. Start ngrok Tunnel (WSL)

```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://xxx.ngrok-free.dev`) and update:
- `frontend/.env` → `API_URL=https://xxx.ngrok-free.dev/api`

### 5. Start Android Emulator (Windows)

1. Open **Android Studio**
2. Go to **Device Manager**
3. Click **Play** on your emulator (e.g., Pixel 7 API 34)
4. Wait for emulator to fully boot

### 6. Start Metro Bundler (WSL)

```bash
cd /home/jammy/projects/GAME/frontend

# IMPORTANT: Unset ANDROID_HOME to avoid WSL ADB conflicts
env -u ANDROID_HOME -u ANDROID_SDK_ROOT npx expo start --tunnel
```

### 7. Connect to Emulator

- Press `a` in Metro terminal to open on Android
- Or scan QR code with Expo Go app

---

## WSL Configuration

### ~/.bashrc

```bash
# Android SDK (disabled - using Windows emulator via tunnel)
# export ANDROID_HOME=$HOME/Android
# export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
# export PATH=$PATH:$ANDROID_HOME/platform-tools

# Windows ADB alias (for WSL to use Windows emulator)
alias adb='"/mnt/c/Program Files/platform-tools/adb.exe"'
```

**Why disabled?**
- WSL cannot directly connect to Windows emulator
- Using Expo tunnel mode bypasses this limitation
- Windows ADB alias allows checking emulator status from WSL

---

## Quick Start Script

Create `start-dev.sh` in project root:

```bash
#!/bin/bash

echo "=== Starting Development Environment ==="

# 1. PostgreSQL
echo "[1/5] Starting PostgreSQL..."
sudo -S service postgresql start

# 2. Ollama (background)
echo "[2/5] Starting Ollama..."
ollama serve &>/dev/null &
sleep 2

# 3. Backend (background)
echo "[3/5] Starting Backend..."
cd /home/jammy/projects/GAME/backend
npm run dev &
sleep 3

# 4. ngrok (background)
echo "[4/5] Starting ngrok..."
ngrok http 3000 --log=stdout &
sleep 5

# Get ngrok URL
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['tunnels'][0]['public_url'])")
echo "Backend URL: $NGROK_URL"

# 5. Frontend
echo "[5/5] Starting Frontend..."
cd /home/jammy/projects/GAME/frontend
echo "Run: env -u ANDROID_HOME npx expo start --tunnel"

echo ""
echo "=== Ready! ==="
echo "1. Start Android Emulator in Android Studio"
echo "2. Press 'a' in Metro terminal or scan QR code"
```

---

## Environment Variables

### Frontend (`frontend/.env`)

```env
API_URL=https://xxx.ngrok-free.dev/api
```

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/c_learning
JWT_SECRET=your-jwt-secret
OLLAMA_URL=http://localhost:11434
```

---

## Ports

| Service | Port | Location |
|---------|------|----------|
| Frontend (Metro) | 8081 | WSL |
| Backend (Express) | 3000 | WSL |
| PostgreSQL | 5432 | WSL |
| Ollama | 11434 | WSL |
| ngrok Dashboard | 4040 | WSL |
| Android Emulator | 5554 | Windows |

---

## Troubleshooting

### Metro can't connect to emulator
- Use `--tunnel` mode instead of `--lan`
- Unset `ANDROID_HOME`: `env -u ANDROID_HOME npx expo start --tunnel`

### Backend not reachable from app
- Check ngrok is running: `curl http://127.0.0.1:4040/api/tunnels`
- Update `API_URL` in frontend `.env` with new ngrok URL

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Check Windows emulator from WSL
```bash
adb devices
# Should show: emulator-5554 device
```

---

## Production Deployment

For production, we will use **Docker Compose**:

```yaml
# docker-compose.yml (future)
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/c_learning

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
```

**Development vs Production:**

| Aspect | Development | Production |
|--------|-------------|------------|
| Frontend | Metro + Expo tunnel | Built APK/AAB |
| Backend | npm run dev | Docker container |
| Database | Local PostgreSQL | Docker PostgreSQL |
| AI | Local Ollama | Docker Ollama |
| Network | ngrok tunnel | Direct / Load balancer |

---

## Summary

**Development workflow:**
1. PostgreSQL 시작
2. Ollama 시작
3. Backend 시작 (`npm run dev`)
4. ngrok 터널 시작
5. Android Studio에서 에뮬레이터 실행
6. Metro 시작 (`env -u ANDROID_HOME npx expo start --tunnel`)
7. 앱 연결 (a 키 또는 QR 코드)

**Key points:**
- WSL에서 코드 실행, Windows에서 에뮬레이터 실행
- Expo tunnel 모드로 네트워크 격리 문제 해결
- ngrok으로 백엔드 외부 접근 가능
- `ANDROID_HOME` 환경변수 해제 필수
