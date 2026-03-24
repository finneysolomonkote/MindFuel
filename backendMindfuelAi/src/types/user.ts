import { UserRole, Status } from './common';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  status: Status;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserProfile extends User {
  total_goals: number;
  completed_goals: number;
  total_journal_entries: number;
  total_purchased_books: number;
  total_reading_time_minutes: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
}

export interface UpdateUserDto {
  full_name?: string;
  phone_number?: string;
  profile_image_url?: string;
}

export interface UpdateUserPasswordDto {
  current_password: string;
  new_password: string;
}
