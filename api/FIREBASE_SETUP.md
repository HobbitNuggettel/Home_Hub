# 🔥 Firebase Service Account Setup Guide

This guide will help you set up Firebase Admin SDK credentials to enable the Home Hub API to integrate with your Firebase project.

## 📋 Prerequisites

- Firebase project with Realtime Database enabled
- Firebase project with Authentication enabled
- Admin access to Firebase Console

## 🚀 Step-by-Step Setup

### 1. Go to Firebase Console
- Visit [Firebase Console](https://console.firebase.google.com/)
- Select your project: `home-hub-app-18bcf`

### 2. Navigate to Project Settings
- Click the gear icon ⚙️ next to "Project Overview"
- Select "Project settings"

### 3. Go to Service Accounts Tab
- Click on the "Service accounts" tab
- You should see "Firebase Admin SDK" section

### 4. Generate New Private Key
- Click "Generate new private key" button
- Click "Generate key" in the confirmation dialog
- A JSON file will be downloaded to your computer

### 5. Extract Service Account Details
Open the downloaded JSON file. It will look like this:

```json
{
  "type": "service_account",
  "project_id": "home-hub-app-18bcf",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@home-hub-app-18bcf.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40home-hub-app-18bcf.iam.gserviceaccount.com"
}
```

### 6. Update Your .env File
Copy these values to your `api/.env` file:

```bash
# Firebase Configuration
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=home-hub-app-18bcf
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@home-hub-app-18bcf.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40home-hub-app-18bcf.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://home-hub-app-18bcf-default-rtdb.firebaseio.com
```

### 7. Important Notes

#### Private Key Formatting
- The `FIREBASE_PRIVATE_KEY` must include the newline characters (`\n`)
- Wrap the entire value in quotes
- Make sure there are no extra spaces or line breaks

#### Security
- **NEVER commit your .env file to version control**
- Keep your service account credentials secure
- The service account has admin access to your Firebase project

## 🔧 Testing the Setup

### 1. Restart Your API Server
```bash
cd api
pkill -f "node.*server.js"
node server.js
```

### 2. Check Console Output
You should see:
```
🔥 Firebase Admin SDK initialized successfully
```

### 3. Test Firebase Auth Endpoints
Visit `http://localhost:5001/api-docs` and test:
- `POST /api/firebase-auth/register`
- `POST /api/firebase-auth/login`
- `GET /api/firebase-auth/verify`

## 🚨 Troubleshooting

### Error: "Firebase Admin SDK initialization failed"
- Check that all environment variables are set correctly
- Verify the private key format (including `\n` characters)
- Ensure the service account has the correct permissions

### Error: "Permission denied" when accessing Firebase
- Verify the service account has the necessary IAM roles
- Check that Realtime Database rules allow the service account access
- Ensure the project ID matches your Firebase project

### Mock Mode Fallback
If Firebase initialization fails, the API will fall back to mock mode for development:
```
🎭 Creating mock Firebase Admin for development
```

## 🔐 Mock Tokens for Development

When using mock mode, you can use these test tokens:

- **Admin User**: `mock-admin-token`
- **Regular User**: `mock-user-token`

## 📚 Next Steps

After successful setup:
1. Test user registration and login
2. Verify Firebase Realtime Database integration
3. Test permission-based access control
4. Integrate with the web UI user management system

## 🆘 Need Help?

If you encounter issues:
1. Check the API server console for error messages
2. Verify your Firebase project configuration
3. Ensure all environment variables are correctly set
4. Check Firebase Console for any permission issues

---

**🎯 Goal**: Enable the Home Hub API to authenticate users via Firebase and enforce permission-based access control using your existing user management system.
