export interface DashboardStats {
  total_users: number;
  active_users_30d: number;
  total_workbooks: number;
  total_orders: number;
  revenue_total: number;
  revenue_30d: number;
}

export interface UserActivity {
  date: string;
  active_users: number;
  new_users: number;
}

export interface RevenueAnalytics {
  date: string;
  revenue: number;
  orders: number;
}

export interface WorkbookAnalytics {
  workbook_id: string;
  workbook_title: string;
  total_users: number;
  completed_users: number;
  average_progress: number;
  average_reading_time_minutes: number;
}

export interface PopularContent {
  id: string;
  title: string;
  type: 'workbook' | 'chapter';
  views: number;
  unique_users: number;
}
