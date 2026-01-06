# FCM Push Notifications - Environment Variables

This document outlines the required environment variables for the FCM (Firebase Cloud Messaging) push notification system.

## Required Environment Variables

### Client-Side (Public) Variables

Add these to your `.env.local` file with the `NEXT_PUBLIC_` prefix:

```env
# Firebase Web Config (Client-Side)
# These are already set in src/lib/firebase.js but can be configured via environment variables
# Note: Firebase config values are safe to expose publicly

# Firebase VAPID Key for Web Push
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key-here
```

### Server-Side (Private) Variables

Add these to your `.env.local` file:

```env
# Firebase Admin SDK Service Account
# This should be a JSON string of your Firebase service account key
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

## How to Obtain These Values

### 1. Firebase VAPID Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`techsersales-4e89c`)
3. Go to **Project Settings** > **Cloud Messaging** tab
4. Scroll to **Web Push certificates**
5. If you don't have a key pair, click **Generate key pair**
6. Copy the **Key pair** value (this is your VAPID key)

### 2. Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts** tab
4. Click **Generate new private key**
5. Save the downloaded JSON file securely
6. Convert the JSON to a single-line string (remove newlines)
7. Add it to `.env.local` as shown above

## Removed Environment Variables

The following Knock-related environment variables are **no longer needed** and can be removed:

```env
# NO LONGER NEEDED - REMOVE THESE
KNOCK_SECRET_API_KEY
KNOCK_SECRET_KEY
NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY
NEXT_PUBLIC_KNOCK_FEED_ID
NEXT_PUBLIC_KNOCK_PUSH_CHANNEL_ID
```

## Example `.env.local` Configuration

```env
# ============================================
# FCM PUSH NOTIFICATIONS
# ============================================

# Firebase VAPID Key (from Firebase Console > Cloud Messaging > Web Push certificates)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BHx1a2b3... (your actual VAPID key)

# Firebase Admin SDK Service Account (JSON string, keep on one line)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"techsersales-4e89c",...}'

# ============================================
# OTHER ENVIRONMENT VARIABLES
# ============================================

# Your existing variables...
NEXTAUTH_SECRET=...
MONGODB_URI=...
# etc.
```

## Testing the Configuration

After setting up the environment variables:

1. Restart your development server
2. Login to the application
3. Grant notification permissions when prompted
4. Check browser console for `[FCM] Token registered successfully`
5. Send a test notification from the admin panel
6. Verify notification appears

## Troubleshooting

### Token Not Registering

- Verify `NEXT_PUBLIC_FIREBASE_VAPID_KEY` is set correctly
- Check browser console for Firebase errors
- Ensure notification s are granted

### Notifications Not Sending

- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON
- Check server logs for Firebase Admin SDK errors
- Ensure the service account has Cloud Messaging permissions

### Background Notifications Not Working

- Verify `firebase-messaging-sw.js` is accessible at `/firebase-messaging-sw.js`
- Check service worker registration in browser DevTools
- Ensure Firebase config in service worker matches your project
