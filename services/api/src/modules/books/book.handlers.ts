import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '@mindfuel/types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';

export const getAllBooks = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { category, status, search } = req.query;
    const supabase = getSupabase();

    let query = supabase
      .from('books')
      .select('*, book_tags(tags(*))');

    if (category) {
      query = query.eq('category', category);
    }

    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.eq('status', 'published');
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch books');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data: book } = await supabase
      .from('books')
      .select('*, book_tags(tags(*)), book_chapters(id, title, chapter_number, is_free)')
      .eq('id', id)
      .single();

    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', id)
      .eq('is_active', true)
      .maybeSingle();

    res.json({
      success: true,
      data: {
        ...book,
        has_access: !!entitlement || book.is_free,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookChapters = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { bookId } = req.params;
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('is_active', true)
      .maybeSingle();

    const { data: chapters, error } = await supabase
      .from('book_chapters')
      .select('*, book_sections(id, title)')
      .eq('book_id', bookId)
      .order('chapter_number');

    if (error) throw new AppError(500, 'Failed to fetch chapters');

    const accessibleChapters = chapters?.map((chapter) => ({
      ...chapter,
      has_access: !!entitlement || chapter.is_free,
    }));

    res.json({ success: true, data: accessibleChapters });
  } catch (error) {
    next(error);
  }
};

export const getChapterContent = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data: chapter } = await supabase
      .from('book_chapters')
      .select('*, books(id, is_free)')
      .eq('id', chapterId)
      .single();

    if (!chapter) {
      throw new AppError(404, 'Chapter not found');
    }

    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', chapter.books.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!entitlement && !chapter.is_free && !chapter.books.is_free) {
      throw new AppError(403, 'Access denied. Purchase required.');
    }

    const { data: sections } = await supabase
      .from('book_sections')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('section_number');

    res.json({
      success: true,
      data: {
        ...chapter,
        sections,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createBook = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const bookData = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('books')
      .insert(bookData)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create book');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const bookData = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('books')
      .update(bookData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to update book');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('books')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) throw new AppError(500, 'Failed to delete book');

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
