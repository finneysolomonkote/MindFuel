import { getSupabase } from '../supabase';
import { generateBatchEmbeddings } from './embedding.service';
import { logger } from '@mindfuel/utils';

export interface ContentChunk {
  text: string;
  bookId: string;
  chapterId?: string;
  sectionId?: string;
  pageNumber?: number;
  chunkIndex: number;
  metadata?: any;
}

const MAX_CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export const chunkText = (
  text: string,
  maxSize: number = MAX_CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): string[] => {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + maxSize);
    chunks.push(chunkWords.join(' '));
    i += maxSize - overlap;
  }

  return chunks;
};

export const ingestBookContent = async (bookId: string): Promise<void> => {
  logger.info('Starting book content ingestion', { bookId });

  const supabase = getSupabase();

  const { data: chapters } = await supabase
    .from('book_chapters')
    .select('*, book_sections(*)')
    .eq('book_id', bookId)
    .order('chapter_number');

  if (!chapters || chapters.length === 0) {
    logger.warn('No chapters found for book', { bookId });
    return;
  }

  await supabase.from('content_chunks').delete().eq('book_id', bookId);

  const allChunks: ContentChunk[] = [];

  for (const chapter of chapters) {
    if (chapter.content) {
      const textChunks = chunkText(chapter.content);
      textChunks.forEach((text, index) => {
        allChunks.push({
          text,
          bookId,
          chapterId: chapter.id,
          chunkIndex: index,
          metadata: {
            chapter_number: chapter.chapter_number,
            chapter_title: chapter.title,
            word_count: text.split(/\s+/).length,
          },
        });
      });
    }

    if (chapter.book_sections) {
      for (const section of chapter.book_sections) {
        if (section.content) {
          const textChunks = chunkText(section.content);
          textChunks.forEach((text, index) => {
            allChunks.push({
              text,
              bookId,
              chapterId: chapter.id,
              sectionId: section.id,
              pageNumber: section.page_number,
              chunkIndex: index,
              metadata: {
                chapter_number: chapter.chapter_number,
                chapter_title: chapter.title,
                section_number: section.section_number,
                section_title: section.title,
                word_count: text.split(/\s+/).length,
              },
            });
          });
        }
      }
    }
  }

  logger.info('Generated chunks', { bookId, count: allChunks.length });

  const BATCH_SIZE = 20;
  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => c.text);

    const embeddings = await generateBatchEmbeddings(texts);

    const records = batch.map((chunk, idx) => ({
      book_id: chunk.bookId,
      chapter_id: chunk.chapterId,
      section_id: chunk.sectionId,
      page_number: chunk.pageNumber,
      chunk_text: chunk.text,
      chunk_index: chunk.chunkIndex,
      token_count: Math.ceil(chunk.text.split(/\s+/).length * 1.3),
      embedding: embeddings[idx].embedding,
      metadata: chunk.metadata,
    }));

    const { error } = await supabase.from('content_chunks').insert(records);

    if (error) {
      logger.error('Failed to insert chunk batch', { error, batch: i });
      throw error;
    }

    logger.info('Inserted chunk batch', {
      bookId,
      batch: i / BATCH_SIZE + 1,
      total: Math.ceil(allChunks.length / BATCH_SIZE),
    });
  }

  await supabase
    .from('books')
    .update({ embedding_status: 'completed' })
    .eq('id', bookId);

  logger.info('Completed book content ingestion', {
    bookId,
    totalChunks: allChunks.length,
  });
};

export const reindexBook = async (bookId: string): Promise<void> => {
  logger.info('Reindexing book', { bookId });

  await ingestBookContent(bookId);
};

export const deleteBookEmbeddings = async (bookId: string): Promise<void> => {
  const supabase = getSupabase();

  await supabase.from('content_chunks').delete().eq('book_id', bookId);

  await supabase
    .from('books')
    .update({ embedding_status: null })
    .eq('id', bookId);

  logger.info('Deleted book embeddings', { bookId });
};
