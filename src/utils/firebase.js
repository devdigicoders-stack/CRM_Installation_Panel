import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { request } from './api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let messaging = null;

// Initialize Firebase App
try {
  if (firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } else {
    console.warn('Firebase client config keys are missing in .env file.');
  }
} catch (error) {
  console.error('Firebase initialization failed on frontend:', error);
}

/**
 * Register FCM device token with the backend API
 * @param {string} token 
 */
export const saveTokenToBackend = async (token) => {
  try {
    await request('/users/fcm-token', {
      method: 'POST',
      body: { token },
    });
    console.log('Successfully registered FCM token with backend.');
  } catch (error) {
    console.error('Failed to register FCM token with backend:', error.message);
  }
};

/**
 * Request notification permissions and register token
 */
export const initNotifications = async () => {
  if (!messaging) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.warn('VAPID Key is missing. Cannot register FCM token.');
        return;
      }

      // Request FCM Token
      const token = await getToken(messaging, {
        vapidKey: vapidKey,
      });

      if (token) {
        console.log('FCM Token received:', token);
        await saveTokenToBackend(token);
      } else {
        console.warn('No registration token available. Request permission to generate one.');
      }
    } else {
      console.warn('Notification permission denied.');
    }
  } catch (error) {
    console.error('An error occurred while retrieving FCM token:', error);
  }
};

/**
 * Listen for foreground push notifications
 */
export const listenForMessages = () => {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Message received in foreground: ', payload);
    
    // Use the browser Notification API to display it
    if (Notification.permission === 'granted') {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/vite.svg',
      });
    }
  });
};
