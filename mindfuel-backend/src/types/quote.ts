import { Status } from './common';

export interface Quote {
  id: string;
  text: string;
  author: string;
  category?: string;
  tags: string[];
  status: Status;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateQuoteDto {
  text: string;
  author: string;
  category?: string;
  tags?: string[];
}

export interface UpdateQuoteDto {
  text?: string;
  author?: string;
  category?: string;
  tags?: string[];
  status?: Status;
}

export interface DailyQuote {
  id: string;
  quote_id: string;
  date: string;
  created_at: string;
}
