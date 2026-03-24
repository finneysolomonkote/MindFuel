import * as admin from 'firebase-admin';
import { config } from '../config';

let firebaseApp: admin.app.App;

export const initializeFirebase = () => {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      privateKey: config.firebase.privateKey,
      clientEmail: config.firebase.clientEmail,
    }),
  });
};

export const getFirebaseApp = (): admin.app.App => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }
  return firebaseApp;
};

export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<string> => {
  const message: admin.messaging.Message = {
    token,
    notification: {
      title,
      body,
    },
    data,
  };

  return admin.messaging().send(message);
};

export const sendMulticastNotification = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<admin.messaging.BatchResponse> => {
  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title,
      body,
    },
    data,
  };

  return admin.messaging().sendEachForMulticast(message);
};
