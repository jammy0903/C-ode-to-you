import Anthropic from '@anthropic-ai/sdk';
import { ClaudeGenerateOptions } from './ai.types';
import logger from '../../utils/logger';

const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';
const DEFAULT_MAX_TOKENS = 2048;
const DEFAULT_TEMPERATURE = 0.7;

export class ClaudeService {
  /**
   * Generate a response from Claude API
   */
  async generate(
    apiKey: string,
    prompt: string,
    systemPrompt?: string,
    options?: ClaudeGenerateOptions
  ): Promise<string> {
    const client = new Anthropic({ apiKey });
    const model = options?.model || DEFAULT_MODEL;

    logger.info(`Sending request to Claude (${model}): ${prompt.substring(0, 100)}...`);

    try {
      const message = await client.messages.create({
        model,
        max_tokens: options?.maxTokens || DEFAULT_MAX_TOKENS,
        temperature: options?.temperature || DEFAULT_TEMPERATURE,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = message.content.find((block) => block.type === 'text');
      const response = textBlock ? textBlock.text : '';

      logger.info(
        `Claude response received (${message.usage.input_tokens} input, ${message.usage.output_tokens} output tokens)`
      );

      return response;
    } catch (error: any) {
      logger.error('Claude API error:', error.message);

      if (error.status === 401) {
        throw new Error('Invalid AI API key. Please check your Anthropic API key.');
      }
      if (error.status === 429) {
        throw new Error('AI API rate limit exceeded. Please try again later.');
      }
      if (error.status === 400) {
        throw new Error(`AI API request error: ${error.message}`);
      }

      throw new Error(`AI service error: ${error.message}`);
    }
  }

  /**
   * Check if the given API key is valid
   */
  async healthCheck(apiKey: string): Promise<boolean> {
    try {
      const client = new Anthropic({ apiKey });
      await client.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}
