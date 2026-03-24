import { getSupabase } from '../supabase';
import { generateEmbedding } from './embedding.service';
import { logger } from '../../utils';

export interface RetrievalOptions {
  userId: string;
  query: string;
  bookId?: string;
  chapterId?: string;
  sectionId?: string;
  limit?: number;
  similarityThreshold?: number;
}

export interface RetrievedChunk {
  id: string;
  chunk_text: string;
  book_id: string;
  chapter_id?: string;
  section_id?: string;
  page_number?: number;
  similarity: number;
  book_title?: string;
  chapter_title?: string;
  section_title?: string;
  metadata?: any;
}

export const retrieveRelevantContent = async (
  options: RetrievalOptions
): Promise<RetrievedChunk[]> => {
  const {
    userId,
    query,
    bookId,
    chapterId,
    sectionId,
    limit = 5,
    similarityThreshold = 0.7,
  } = options;

  const supabase = getSupabase();

  const { embedding } = await generateEmbedding(query);

  if (bookId) {
    const { data: hasAccess } = await supabase
      .from('entitlements')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('is_active', true)
      .maybeSingle();

    const { data: bookIsFree } = await supabase
      .from('books')
      .select('is_free')
      .eq('id', bookId)
      .single();

    if (!hasAccess && !bookIsFree?.is_free) {
      logger.warn('User attempted to retrieve content without access', {
        userId,
        bookId,
      });
      return [];
    }

    let query = supabase.rpc('match_book_chunks', {
      query_embedding: embedding,
      match_threshold: similarityThreshold,
      match_count: limit,
      filter_book_id: bookId,
      filter_chapter_id: chapterId || null,
      filter_section_id: sectionId || null,
    });

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to retrieve book chunks', { error });
      throw error;
    }

    return data || [];
  }

  const { data: entitlements } = await supabase
    .from('entitlements')
    .select('book_id')
    .eq('user_id', userId)
    .eq('is_active', true);

  const ownedBookIds = entitlements?.map((e) => e.book_id) || [];

  const { data: freeBooks } = await supabase
    .from('books')
    .select('id')
    .eq('is_free', true);

  const accessibleBookIds = [
    ...ownedBookIds,
    ...(freeBooks?.map((b) => b.id) || []),
  ];

  if (accessibleBookIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase.rpc('match_user_chunks', {
    query_embedding: embedding,
    match_threshold: similarityThreshold,
    match_count: limit,
    accessible_book_ids: accessibleBookIds,
  });

  if (error) {
    logger.error('Failed to retrieve user chunks', { error });
    throw error;
  }

  return data || [];
};

export const logRetrieval = async (
  userId: string,
  conversationId: string,
  query: string,
  retrievedChunks: RetrievedChunk[],
  tokensUsed: number
) => {
  const supabase = getSupabase();

  await supabase.from('retrieval_logs').insert({
    user_id: userId,
    conversation_id: conversationId,
    query,
    chunks_retrieved: retrievedChunks.length,
    tokens_used: tokensUsed,
    chunk_ids: retrievedChunks.map((c) => c.id),
    avg_similarity: retrievedChunks.length > 0
      ? retrievedChunks.reduce((sum, c) => sum + c.similarity, 0) /
        retrievedChunks.length
      : 0,
  });
};
