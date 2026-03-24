import { OpenAI } from 'openai';
import { config } from '../../config';
import { logger } from '../../utils';
import { BuiltPrompt } from './prompt.service';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResult {
  content: string;
  tokensUsed: number;
  model: string;
  finishReason: string;
}

export const generateChatCompletion = async (
  messages: ChatMessage[],
  builtPrompt: BuiltPrompt,
  modelConfig?: any
): Promise<ChatCompletionResult> => {
  try {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `${builtPrompt.systemPrompt}

${builtPrompt.guardrails}

${builtPrompt.contextPrompt}`,
    };

    const allMessages = [systemMessage, ...messages];

    const model = modelConfig?.model_name || config.openai.model || 'gpt-4-turbo-preview';
    const temperature = modelConfig?.temperature ?? 0.7;
    const maxTokens = modelConfig?.max_tokens ?? 1000;

    const response = await openai.chat.completions.create({
      model,
      messages: allMessages,
      temperature,
      max_tokens: maxTokens,
      top_p: modelConfig?.top_p ?? 1,
      frequency_penalty: modelConfig?.frequency_penalty ?? 0,
      presence_penalty: modelConfig?.presence_penalty ?? 0,
    });

    const choice = response.choices[0];

    return {
      content: choice.message.content || '',
      tokensUsed: response.usage?.total_tokens || 0,
      model: response.model,
      finishReason: choice.finish_reason,
    };
  } catch (error) {
    logger.error('Failed to generate chat completion', { error });
    throw error;
  }
};

export const moderateContent = async (text: string): Promise<boolean> => {
  try {
    const response = await openai.moderations.create({
      input: text,
    });

    const result = response.results[0];

    if (result.flagged) {
      logger.warn('Content flagged by moderation', {
        categories: result.categories,
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Failed to moderate content', { error });
    return true;
  }
};
