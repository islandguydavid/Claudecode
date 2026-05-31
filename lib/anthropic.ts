import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-placeholder',
    });
  }
  return _client;
}

export const MODEL = 'claude-sonnet-4-5-20251001';
