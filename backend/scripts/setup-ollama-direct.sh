#!/bin/bash

# Ollama 직접 설치 스크립트 (Docker 없이)
# Direct Ollama installation script (without Docker)

set -e

echo "================================"
echo "Ollama 직접 설치 (Direct Install)"
echo "================================"
echo ""

# Check if Ollama is already installed
if command -v ollama &> /dev/null; then
    echo "✓ Ollama가 이미 설치되어 있습니다."
    echo ""
else
    echo "1. Ollama 설치 중..."
    echo "   (sudo 비밀번호가 필요합니다)"
    echo ""

    curl -fsSL https://ollama.com/install.sh | sh

    if [ $? -eq 0 ]; then
        echo "✓ Ollama 설치 완료"
        echo ""
    else
        echo "✗ Ollama 설치 실패"
        echo "   수동으로 설치해주세요: curl -fsSL https://ollama.com/install.sh | sh"
        exit 1
    fi
fi

# Check if Ollama is running
echo "2. Ollama 서비스 상태 확인 중..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✓ Ollama가 실행 중입니다."
    echo ""
else
    echo "   Ollama가 실행되지 않았습니다. 시작 중..."

    # Start Ollama in background
    nohup ollama serve > /tmp/ollama.log 2>&1 &
    OLLAMA_PID=$!

    echo "   Ollama PID: $OLLAMA_PID"
    echo "   로그 파일: /tmp/ollama.log"
    echo ""

    # Wait for Ollama to be ready
    echo "   Ollama 준비 대기 중..."
    for i in {1..30}; do
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            echo "✓ Ollama 서비스 시작 완료"
            echo ""
            break
        fi

        if [ $i -eq 30 ]; then
            echo "✗ Ollama 서비스 시작 실패 (타임아웃)"
            echo "   로그 확인: tail -f /tmp/ollama.log"
            exit 1
        fi

        sleep 1
    done
fi

# Pull Kanana model
echo "3. Kanana Nano 모델 다운로드 중..."
echo "   모델 크기: 약 1.3GB"
echo "   (시간이 걸릴 수 있습니다)"
echo ""

ollama pull huihui_ai/kanana-nano-abliterated

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ 모델 다운로드 완료"
    echo ""
else
    echo ""
    echo "✗ 모델 다운로드 실패"
    echo "   수동으로 다운로드: ollama pull huihui_ai/kanana-nano-abliterated"
    exit 1
fi

# Verify installation
echo "4. 설치 확인 중..."
echo ""

ollama list

echo ""
echo "================================"
echo "✓ 설정 완료!"
echo "================================"
echo ""
echo "다음 단계:"
echo "1. 백엔드 서버 실행: npm run dev"
echo "2. AI API 테스트: curl http://localhost:3000/api/ai/chat/[problem-id]"
echo ""
echo "Ollama를 백그라운드에서 계속 실행하려면:"
echo "  nohup ollama serve > /dev/null 2>&1 &"
echo ""
echo "Ollama를 중지하려면:"
echo "  pkill ollama"
echo ""
