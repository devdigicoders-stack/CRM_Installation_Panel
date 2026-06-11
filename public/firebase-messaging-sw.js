// Import and configure the Firebase SDK (Compat version is easiest for service workers)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// NOTE: Since Vite env variables aren't directly bundled into public assets,
// you should update these placeholders with your actual Firebase config keys.
firebase.initializeApp({
  apiKey: "AIzaSyCGlmY-ior7xqv_-4PiQcs1CoePb7IDM90",
  authDomain: "collegepanel-1027b.firebaseapp.com",
  projectId: "collegepanel-1027b",
  storageBucket: "collegepanel-1027b.firebasestorage.app",
  messagingSenderId: "335340683871",
  appId: "1:335340683871:web:281073ee5281c4fe5bd1ea"
});

const messaging = firebase.messaging();

// Customize background message handling
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  
  const notificationTitle = payload.notification.title || 'CRM Notification';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new update in CRM.',
    icon: '/vite.svg',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
