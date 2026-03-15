import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '@mindfuel/types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';
import {
  ingestBookContent,
  reindexBook,
  deleteBookEmbeddings,
} from '../../lib/ai/ingestion.service';
import { logger } from '@mindfuel/utils';

export const ingestBook = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { bookId } = req.params;
    const supabase = getSupabase();

    const { data: book } = await supabase
      .from('books')
      .select('id, title')
      .eq('id', bookId)
      .single();

    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    await supabase
      .from('books')
      .update({ embedding_status: 'processing' })
      .eq('id', bookId);

    ingestBookContent(bookId).catch((error) => {
      logger.error('Failed to ingest book content', { bookId, error });
      supabase
        .from('books')
        .update({ embedding_status: 'failed' })
        .eq('id', bookId);
    });

    res.json({
      success: true,
      message: 'Book ingestion started',
      data: { book_id: bookId, book_title: book.title },
    });
  } catch (error) {
    next(error);
  }
};

export const reindexBookContent = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { bookId } = req.params;
    const supabase = getSupabase();

    const { data: book } = await supabase
      .from('books')
      .select('id, title')
      .eq('id', bookId)
      .single();

    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    await supabase
      .from('books')
      .update({ embedding_status: 'processing' })
      .eq('id', bookId);

    reindexBook(bookId).catch((error) => {
      logger.error('Failed to reindex book', { bookId, error });
      supabase
        .from('books')
        .update({ embedding_status: 'failed' })
        .eq('id', bookId);
    });

    res.json({
      success: true,
      message: 'Book reindexing started',
      data: { book_id: bookId, book_title: book.title },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBookIndex = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { bookId } = req.params;

    await deleteBookEmbeddings(bookId);

    res.json({
      success: true,
      message: 'Book embeddings deleted',
      data: { book_id: bookId },
    });
  } catch (error) {
    next(error);
  }
};

export const getIngestionStatus = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const supabase = getSupabase();

    const { data: books } = await supabase
      .from('books')
      .select('id, title, embedding_status, created_at, updated_at')
      .order('updated_at', { ascending: false });

    const { count: totalChunks } = await supabase
      .from('content_chunks')
      .select('*', { count: 'exact', head: true });

    const statusCounts = books?.reduce((acc: any, book) => {
      const status = book.embedding_status || 'not_started';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total_books: books?.length || 0,
        total_chunks: totalChunks || 0,
        status_counts: statusCounts,
        books,
      },
    });
  } catch (error) {
    next(error);
  }
};
