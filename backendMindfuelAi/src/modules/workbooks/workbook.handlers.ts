import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse, CreateWorkbookDto, UpdateWorkbookDto } from '../../types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';
import { addEmbeddingJob } from '../../workers';

export const listWorkbooks = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('workbooks')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getWorkbook = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { data } = await supabase
      .from('workbooks')
      .select('*')
      .eq('id', id)
      .single();

    if (!data) throw new AppError(404, 'Workbook not found');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createWorkbook = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const workbookData = req.body;
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('workbooks')
      .insert({
        ...workbookData,
        created_by: userId,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create workbook');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateWorkbook = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('workbooks')
      .update(updates)
      .eq('id', id);

    if (error) throw new AppError(500, 'Failed to update workbook');

    res.json({ success: true, message: 'Workbook updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkbook = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('workbooks')
      .update({ status: 'deleted' })
      .eq('id', id);

    if (error) throw new AppError(500, 'Failed to delete workbook');

    res.json({ success: true, message: 'Workbook deleted' });
  } catch (error) {
    next(error);
  }
};

export const getChapters = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { data } = await supabase
      .from('workbook_chapters')
      .select('*')
      .eq('workbook_id', id)
      .eq('status', 'active')
      .order('chapter_number', { ascending: true });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createChapter = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const chapterData = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('workbook_chapters')
      .insert({
        ...chapterData,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create chapter');

    if (data.content) {
      await addEmbeddingJob({
        type: 'chapter',
        id: data.id,
        content: data.content,
      });
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSections = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { chapterId } = req.params;
    const supabase = getSupabase();

    const { data } = await supabase
      .from('workbook_sections')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('status', 'active')
      .order('section_number', { ascending: true });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createSection = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const sectionData = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('workbook_sections')
      .insert({
        ...sectionData,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create section');

    await addEmbeddingJob({
      type: 'section',
      id: data.id,
      content: data.content,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
