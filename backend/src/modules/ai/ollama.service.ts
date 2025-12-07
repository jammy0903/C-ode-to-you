/**
 * @file ollama.service.ts
 * @description Ollama LLM integration service
 *
 * @principles
 * - SRP: ✅ Single responsibility - Ollama API integration only
 * - Configuration: Uses environment variables for flexibility (Docker/local)
 *
 * @functions
 * - generate(prompt, systemPrompt?): Promise<string> - Generate LLM response with optional system prompt
 * - healthCheck(): Promise<boolean> - Check if Ollama service is available
 *
 * @configuration
 * - OLLAMA_BASE_URL: Ollama server URL (default: http://localhost:11434)
 * - MODEL_NAME: qwen2.5-coder:1.5b - Coding-specialized model
 * - temperature: 0.7 - Response randomness
 * - top_p: 0.9 - Nucleus sampling
 * - num_predict: 1024 - Max tokens to generate
 * - timeout: 60000ms - API call timeout
 *
 * @duplicateLogic
 * - ✅ No duplicate logic - clean service
 */

import axios from 'axios';
import { OllamaGenerateRequest, OllamaGenerateResponse } from './ai.types';
import logger from '../../utils/logger';

export class OllamaService {
  private readonly OLLAMA_BASE_URL: string;
  private readonly MODEL_NAME = 'qwen2.5-coder:1.5b';

  constructor() {
    // Docker Compose에서는 service 이름으로 접근, 로컬 개발시는 localhost
    this.OLLAMA_BASE_URL =
      process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  /**
   * Generate response from Ollama
   */
  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const request: OllamaGenerateRequest = {
        model: this.MODEL_NAME,
        prompt,
        stream: false,
        system: systemPrompt,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 1024,
        },
      };

      logger.info(`Sending request to Ollama: ${prompt.substring(0, 100)}...`);

      const response = await axios.post<OllamaGenerateResponse>(
        `${this.OLLAMA_BASE_URL}/api/generate`,
        request,
        {
          timeout: 60000, // 60 seconds
        }
      );

      logger.info(`Ollama response received (${response.data.eval_count} tokens)`);

      return response.data.response;
    } catch (error: any) {
      logger.error('Ollama generate error:', error.message);

      if (error.code === 'ECONNREFUSED') {
        throw new Error(
          'Ollama service is not running. Please start Ollama with: docker-compose up ollama'
        );
      }

      throw new Error(`AI service error: ${error.message}`);
    }
  }

  /**
   * Check if Ollama service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.OLLAMA_BASE_URL}/api/tags`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      logger.error('Ollama health check failed:', error);
      return false;
    }
  }
}
