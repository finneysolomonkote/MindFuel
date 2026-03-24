import { Status } from './common';

export interface Workbook {
  id: string;
  title: string;
  description: string;
  author: string;
  cover_image_url: string;
  file_url?: string;
  category: string;
  tags: string[];
  is_free: boolean;
  status: Status;
  total_chapters: number;
  estimated_reading_time_minutes: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface WorkbookChapter {
  id: string;
  workbook_id: string;
  chapter_number: number;
  title: string;
  description?: string;
  content?: string;
  embedding?: number[];
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface WorkbookSection {
  id: string;
  chapter_id: string;
  section_number: number;
  title: string;
  content: string;
  embedding?: number[];
  page_number?: number;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkbookDto {
  title: string;
  description: string;
  author: string;
  cover_image_url: string;
  file_url?: string;
  category: string;
  tags: string[];
  is_free: boolean;
}

export interface UpdateWorkbookDto {
  title?: string;
  description?: string;
  author?: string;
  cover_image_url?: string;
  file_url?: string;
  category?: string;
  tags?: string[];
  is_free?: boolean;
  status?: Status;
}

export interface CreateChapterDto {
  workbook_id: string;
  chapter_number: number;
  title: string;
  description?: string;
  content?: string;
}

export interface CreateSectionDto {
  chapter_id: string;
  section_number: number;
  title: string;
  content: string;
  page_number?: number;
}

export interface UserWorkbook {
  id: string;
  user_id: string;
  workbook_id: string;
  progress_percentage: number;
  last_chapter_id?: string;
  last_section_id?: string;
  total_reading_time_minutes: number;
  is_completed: boolean;
  started_at: string;
  completed_at?: string;
  updated_at: string;
}
