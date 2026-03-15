export enum JournalMood {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  NEUTRAL = 'neutral',
  BAD = 'bad',
  TERRIBLE = 'terrible',
}

export interface Journal {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: JournalMood;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateJournalDto {
  title: string;
  content: string;
  mood?: JournalMood;
  tags?: string[];
}

export interface UpdateJournalDto {
  title?: string;
  content?: string;
  mood?: JournalMood;
  tags?: string[];
  is_favorite?: boolean;
}
