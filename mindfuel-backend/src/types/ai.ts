export enum ConversationContext {
  GENERAL = 'general',
  WORKBOOK = 'workbook',
  CHAPTER = 'chapter',
  GOAL = 'goal',
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  context_type?: ConversationContext;
  context_id?: string;
  tokens_used?: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  context_type: ConversationContext;
  context_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
}

export interface CreateConversationDto {
  context_type: ConversationContext;
  context_id?: string;
  title?: string;
}

export interface SendMessageDto {
  conversation_id: string;
  content: string;
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  context_type: ConversationContext;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreatePromptTemplateDto {
  name: string;
  description: string;
  template: string;
  context_type: ConversationContext;
}

export interface UpdatePromptTemplateDto {
  name?: string;
  description?: string;
  template?: string;
  is_active?: boolean;
}

export interface AIModelConfig {
  id: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateAIModelConfigDto {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface SemanticSearchResult {
  id: string;
  content: string;
  similarity: number;
  chapter_title?: string;
  section_title?: string;
  workbook_title?: string;
}
