import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '@mindfuel/types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';
import { retrieveRelevantContent, logRetrieval } from '../../lib/ai/retrieval.service';
import {
  buildSystemPrompt,
  summarizeConversation,
  extractRecommendations,
} from '../../lib/ai/prompt.service';
import { generateChatCompletion, moderateContent } from '../../lib/ai/chat.service';
import { logger } from '@mindfuel/utils';

export const listConversations = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const supabase = getSupabase();

    const { data: conversation } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    const { data: messages } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    res.json({
      success: true,
      data: {
        ...conversation,
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createConversation = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const {
      context_type,
      context_id,
      title,
      book_id,
      chapter_id,
    } = req.body;
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        title: title || `${context_type} conversation`,
        context_type,
        context_id,
        book_id,
        chapter_id,
        is_active: true,
        message_count: 0,
        total_tokens_used: 0,
      })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create conversation');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const {
      conversation_id,
      content,
      book_id,
      chapter_id,
      section_id,
      page_number,
    } = req.body;
    const userId = req.user!.id;
    const supabase = getSupabase();

    const isAppropriate = await moderateContent(content);
    if (!isAppropriate) {
      throw new AppError(
        400,
        'Message contains inappropriate content. Please rephrase your question.'
      );
    }

    const { data: conversation } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversation_id)
      .eq('user_id', userId)
      .single();

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    await supabase.from('ai_messages').insert({
      conversation_id,
      user_id: userId,
      role: 'user',
      content,
      context_type: conversation.context_type,
      context_id: conversation.context_id,
    });

    const retrievedChunks = await retrieveRelevantContent({
      userId,
      query: content,
      bookId: book_id || conversation.book_id,
      chapterId: chapter_id || conversation.chapter_id,
      sectionId: section_id,
      limit: 5,
      similarityThreshold: 0.7,
    });

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: userGoals } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(5);

    const { data: recentProgress } = await supabase
      .from('reading_progress')
      .select('*, books(title)')
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const conversationSummary = await summarizeConversation(conversation_id);

    const builtPrompt = await buildSystemPrompt({
      mode: conversation.context_type as any,
      userId,
      userProfile,
      userGoals: userGoals || undefined,
      recentProgress,
      conversationSummary,
      retrievedChunks,
      bookContext: book_id
        ? {
            bookId: book_id,
            chapterId: chapter_id,
            sectionId: section_id,
            pageNumber: page_number,
          }
        : undefined,
    });

    const { data: messages } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })
      .limit(20);

    const chatMessages = (messages || []).map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const { data: modelConfig } = await supabase
      .from('ai_model_configs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const completion = await generateChatCompletion(
      chatMessages,
      builtPrompt,
      modelConfig
    );

    const { data: assistantMessage } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id,
        user_id: userId,
        role: 'assistant',
        content: completion.content,
        context_type: conversation.context_type,
        context_id: conversation.context_id,
        tokens_used: completion.tokensUsed,
        model: completion.model,
      })
      .select()
      .single();

    await supabase
      .from('ai_conversations')
      .update({
        message_count: conversation.message_count + 2,
        total_tokens_used: conversation.total_tokens_used + completion.tokensUsed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation_id);

    await logRetrieval(
      userId,
      conversation_id,
      content,
      retrievedChunks,
      completion.tokensUsed
    );

    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      conversation_id,
      message_id: assistantMessage.id,
      model: completion.model,
      tokens_used: completion.tokensUsed,
      context_type: conversation.context_type,
      retrieval_count: retrievedChunks.length,
    });

    const recommendations = extractRecommendations(completion.content, {
      mode: conversation.context_type as any,
      userId,
      retrievedChunks,
    });

    const sourceReferences = retrievedChunks.map((chunk) => ({
      book_id: chunk.book_id,
      book_title: chunk.book_title,
      chapter_id: chunk.chapter_id,
      chapter_title: chunk.chapter_title,
      section_id: chunk.section_id,
      section_title: chunk.section_title,
      page_number: chunk.page_number,
      similarity: chunk.similarity,
    }));

    res.json({
      success: true,
      data: {
        message: assistantMessage,
        answer: completion.content,
        mode: conversation.context_type,
        source_references: sourceReferences,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
        usage: {
          tokens_used: completion.tokensUsed,
          model: completion.model,
          chunks_retrieved: retrievedChunks.length,
        },
        conversation_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('ai_conversations')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError(500, 'Failed to delete conversation');

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

export const getPromptTemplates = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const supabase = getSupabase();

    const { data } = await supabase
      .from('ai_prompt_templates')
      .select('*')
      .order('context_type')
      .order('created_at', { ascending: false });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createPromptTemplate = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const templateData = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create prompt template');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updatePromptTemplate = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const templateData = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .update(templateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to update prompt template');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deletePromptTemplate = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('ai_prompt_templates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new AppError(500, 'Failed to delete prompt template');

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

export const getModelConfigs = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const supabase = getSupabase();

    const { data } = await supabase
      .from('ai_model_configs')
      .select('*')
      .order('created_at', { ascending: false });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createModelConfig = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const configData = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('ai_model_configs')
      .insert(configData)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create model config');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateModelConfig = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const configData = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('ai_model_configs')
      .update(configData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to update model config');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAIUsageStats = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { start_date, end_date } = req.query;
    const supabase = getSupabase();

    let query = supabase
      .from('ai_usage_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (start_date) {
      query = query.gte('created_at', start_date);
    }

    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data: usageLogs } = await query.limit(1000);

    const totalTokens = usageLogs?.reduce((sum, log) => sum + log.tokens_used, 0) || 0;
    const totalMessages = usageLogs?.length || 0;
    const uniqueUsers = new Set(usageLogs?.map((log) => log.user_id)).size;

    const byModel = usageLogs?.reduce((acc: any, log) => {
      if (!acc[log.model]) {
        acc[log.model] = { count: 0, tokens: 0 };
      }
      acc[log.model].count++;
      acc[log.model].tokens += log.tokens_used;
      return acc;
    }, {});

    const byContextType = usageLogs?.reduce((acc: any, log) => {
      if (!acc[log.context_type]) {
        acc[log.context_type] = { count: 0, tokens: 0 };
      }
      acc[log.context_type].count++;
      acc[log.context_type].tokens += log.tokens_used;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total_tokens: totalTokens,
        total_messages: totalMessages,
        unique_users: uniqueUsers,
        by_model: byModel,
        by_context_type: byContextType,
        estimated_cost: (totalTokens / 1000000) * 10,
        recent_logs: usageLogs?.slice(0, 50),
      },
    });
  } catch (error) {
    next(error);
  }
};
