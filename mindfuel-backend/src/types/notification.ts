export enum NotificationType {
  DAILY_REMINDER = 'daily_reminder',
  GOAL_REMINDER = 'goal_reminder',
  NEW_CONTENT = 'new_content',
  ACHIEVEMENT = 'achievement',
  SYSTEM = 'system',
}

export enum NotificationStatus {
  SENT = 'sent',
  PENDING = 'pending',
  FAILED = 'failed',
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  is_read: boolean;
  status: NotificationStatus;
  sent_at?: string;
  created_at: string;
}

export interface CreateNotificationDto {
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
}

export interface UserDevice {
  id: string;
  user_id: string;
  device_token: string;
  device_type: 'ios' | 'android';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterDeviceDto {
  device_token: string;
  device_type: 'ios' | 'android';
}
