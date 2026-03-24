import { z } from 'zod';
import { ConversationContext } from '../types';

export const createConversationSchema = z.object({
  context_type: z.nativeEnum(ConversationContext),
  context_id: z.string().uuid().optional(),
  title: z.string().optional(),
});

export const sendMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1, 'Message content is required'),
});

export const createPromptTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  template: z.string().min(1),
  context_type: z.nativeEnum(ConversationContext),
});

export const updatePromptTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  template: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
});

export const updateAIModelConfigSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().positive().optional(),
  top_p: z.number().min(0).max(1).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
});
