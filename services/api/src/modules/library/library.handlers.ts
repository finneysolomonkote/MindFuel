import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '@mindfuel/types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';

export const getUserLibrary = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('user_library')
      .select('*, books(*)')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch library');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const addToLibrary = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { book_id } = req.body;
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from('user_library')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', book_id)
      .maybeSingle();

    if (existing) {
      throw new AppError(400, 'Book already in library');
    }

    const { data, error } = await supabase
      .from('user_library')
      .insert({ user_id: userId, book_id })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to add to library');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const removeFromLibrary = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { bookId } = req.params;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('user_library')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (error) throw new AppError(500, 'Failed to remove from library');

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

export const getReadingProgress = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { bookId } = req.params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();

    if (error) throw new AppError(500, 'Failed to fetch reading progress');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateReadingProgress = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { book_id, chapter_id, section_id, progress_percentage, last_position } = req.body;
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from('reading_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', book_id)
      .maybeSingle();

    let data;
    if (existing) {
      const { data: updated, error } = await supabase
        .from('reading_progress')
        .update({
          chapter_id,
          section_id,
          progress_percentage,
          last_position,
          last_read_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw new AppError(500, 'Failed to update reading progress');
      data = updated;
    } else {
      const { data: created, error } = await supabase
        .from('reading_progress')
        .insert({
          user_id: userId,
          book_id,
          chapter_id,
          section_id,
          progress_percentage,
          last_position,
        })
        .select()
        .single();

      if (error) throw new AppError(500, 'Failed to create reading progress');
      data = created;
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getBookmarks = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { bookId } = req.params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*, book_chapters(title), book_sections(title)')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch bookmarks');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createBookmark = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { book_id, chapter_id, section_id, position, note } = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        book_id,
        chapter_id,
        section_id,
        position,
        note,
      })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create bookmark');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteBookmark = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError(500, 'Failed to delete bookmark');

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

export const getHighlights = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { bookId } = req.params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('highlights')
      .select('*, book_chapters(title)')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch highlights');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createHighlight = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { book_id, chapter_id, section_id, highlighted_text, color, note } = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('highlights')
      .insert({
        user_id: userId,
        book_id,
        chapter_id,
        section_id,
        highlighted_text,
        color,
        note,
      })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create highlight');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteHighlight = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('highlights')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError(500, 'Failed to delete highlight');

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { bookId } = req.params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('notes')
      .select('*, book_chapters(title)')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch notes');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { book_id, chapter_id, section_id, note_text, note_type } = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        book_id,
        chapter_id,
        section_id,
        note_text,
        note_type,
      })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create note');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { note_text } = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('notes')
      .update({ note_text })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to update note');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError(500, 'Failed to delete note');

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
