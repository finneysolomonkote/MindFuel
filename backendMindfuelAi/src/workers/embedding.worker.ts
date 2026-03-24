import { Job } from 'bullmq';
import { logger } from '../utils';
import { generateEmbedding } from '../lib/openai';
import { getSupabase } from '../lib/supabase';

export const processEmbeddingJob = async (job: Job) => {
  try {
    const { type, id, content } = job.data;

    const embedding = await generateEmbedding(content);

    const supabase = getSupabase();

    if (type === 'chapter') {
      await supabase
        .from('workbook_chapters')
        .update({ embedding })
        .eq('id', id);
    } else if (type === 'section') {
      await supabase
        .from('workbook_sections')
        .update({ embedding })
        .eq('id', id);
    }

    logger.info('Embedding generated successfully', { type, id });
  } catch (error) {
    logger.error('Failed to process embedding job', { error });
    throw error;
  }
};
