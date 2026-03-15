import OpenAI from 'openai';
import { config } from '@mindfuel/config';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export const generateChatCompletion = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<{ content: string; tokens: number }> => {
  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return {
    content: response.choices[0]?.message?.content || '',
    tokens: response.usage?.total_tokens || 0,
  };
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });

  return response.data[0].embedding;
};
