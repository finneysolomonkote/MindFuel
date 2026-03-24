import { OpenAI } from 'openai';
import { config } from '../../config';
import { logger } from '../../utils';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
}

export const generateEmbedding = async (text: string): Promise<EmbeddingResult> => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    });

    return {
      embedding: response.data[0].embedding,
      tokens: response.usage.total_tokens,
    };
  } catch (error) {
    logger.error('Failed to generate embedding', { error });
    throw error;
  }
};

export const generateBatchEmbeddings = async (
  texts: string[]
): Promise<EmbeddingResult[]> => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
      dimensions: 1536,
    });

    return response.data.map((item, index) => ({
      embedding: item.embedding,
      tokens: response.usage.total_tokens / texts.length,
    }));
  } catch (error) {
    logger.error('Failed to generate batch embeddings', { error });
    throw error;
  }
};
