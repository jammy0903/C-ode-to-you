#!/bin/bash

echo "================================"
echo "Setting up Ollama with Kanana Model"
echo "================================"
echo ""

# Start Ollama service
echo "1. Starting Ollama service..."
docker-compose up -d ollama

# Wait for Ollama to be ready
echo "2. Waiting for Ollama to be ready..."
until curl -s http://localhost:11434/api/tags > /dev/null 2>&1; do
  echo "   Waiting for Ollama..."
  sleep 2
done
echo "   Ollama is ready!"
echo ""

# Pull Kanana model
echo "3. Downloading Kanana Nano 2.1B-Instruct model..."
echo "   This may take a while (model size: ~1.3GB)..."
docker exec ollama-kanana ollama pull huihui_ai/kanana-nano-abliterated

echo ""
echo "4. Verifying model installation..."
docker exec ollama-kanana ollama list

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Ollama API is now available at: http://localhost:11434"
echo ""
echo "Test the model with:"
echo "curl http://localhost:11434/api/generate -d '{\"model\": \"huihui_ai/kanana-nano-abliterated\", \"prompt\": \"Hello\", \"stream\": false}'"
echo ""
