/*
 * Firebase Local Dev Config — TEMPLATE
 * ──────────────────────────────────────
 * 1. Copy this file to  firebase-local.js
 * 2. Replace every YOUR_... with real values from:
 *    Firebase Console > Project Settings > Your apps > Web app > SDK setup & config
 * 3. firebase-local.js is in .gitignore — NEVER commit it
 *
 * Firebase Console checklist before local dev:
 *   ✓ Authentication > Sign-in methods > enable Email/Password
 *   ✓ Authentication > Sign-in methods > enable Google (add support email)
 *   ✓ Authentication > Settings > Authorized domains > add localhost
 *   ✓ Realtime Database > create database > paste security rules from firebase-init.js
 *   ✓ Realtime Database > Data > admins > add your UID = true (to use admin.html)
 */
window._localFirebaseConfig = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT_ID.firebaseapp.com',
  databaseURL:       'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId:             'YOUR_APP_ID'
};
