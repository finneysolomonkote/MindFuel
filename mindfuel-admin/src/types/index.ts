export interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  phone_number?: string;
  created_at: string;
  last_login?: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  author?: string;
  cover_image_url?: string;
  price?: number;
  is_published: boolean;
  embedding_status?: string;
  created_at: string;
}

export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  chapter_number: number;
  content?: string;
  summary?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  stock_quantity?: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  user?: User;
}

export interface Quote {
  id: string;
  text: string;
  author?: string;
  source_book_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  context_type: string;
  system_prompt: string;
  guardrails?: string;
  is_active: boolean;
  created_at: string;
}

export interface ModelConfig {
  id: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  active_users_30d: number;
  total_books: number;
  total_orders: number;
  total_revenue: number;
  ai_queries_count: number;
  token_usage: number;
  token_cost: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
