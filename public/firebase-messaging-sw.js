// Import and configure the Firebase SDK (Compat version is easiest for service workers)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// NOTE: Since Vite env variables aren't directly bundled into public assets,
// you should update these placeholders with your actual Firebase config keys.
firebase.initializeApp({
  apiKey: "AIzaSyBseyWQJeqs6wrHRSX40OcTVMSoQCfRlss",
  authDomain: "tt-crm-f6a6c.firebaseapp.com",
  projectId: "tt-crm-f6a6c",
  storageBucket: "tt-crm-f6a6c.firebasestorage.app",
  messagingSenderId: "833472295992",
  appId: "1:833472295992:web:2822bf9709d1e43eb8a2cd"
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
