import { Job } from 'bullmq';
import { logger } from '../utils';
import { sendPushNotification } from '../lib/firebase';
import { getSupabase } from '../lib/supabase';

export const processNotificationJob = async (job: Job) => {
  try {
    const { userId, title, body, data } = job.data;

    const supabase = getSupabase();
    const { data: devices } = await supabase
      .from('user_devices')
      .select('device_token')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (!devices || devices.length === 0) {
      logger.info('No active devices found for user', { userId });
      return;
    }

    for (const device of devices) {
      try {
        await sendPushNotification(device.device_token, title, body, data);
      } catch (error) {
        logger.error('Failed to send notification to device', { error, device });
      }
    }

    logger.info('Notification sent successfully', { userId, devicesCount: devices.length });
  } catch (error) {
    logger.error('Failed to process notification job', { error });
    throw error;
  }
};
