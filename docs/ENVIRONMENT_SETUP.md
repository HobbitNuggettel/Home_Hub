# Environment Variables Setup Guide

## 🔐 **CRITICAL: Configure Your Environment Variables**

To run the Home Hub application, you need to create a `.env.local` file in the root directory with your API keys.

### 1. Create `.env.local` File

Create a new file called `.env.local` in the project root directory.

### 2. Add the Following Variables

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

# AI Services
REACT_APP_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Analytics and Monitoring
REACT_APP_ANALYTICS_ID=your_analytics_id
REACT_APP_SENTRY_DSN=your_sentry_dsn

# Development Settings
REACT_APP_ENABLE_DEV_TOOLS=true
REACT_APP_LOG_LEVEL=info
```

### 3. Get Your API Keys

#### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Copy the configuration values

#### HuggingFace Setup
1. Go to [HuggingFace](https://huggingface.co/)
2. Sign up/Login
3. Go to Settings > Access Tokens
4. Create a new token

#### Google Gemini Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Create an API key

### 4. Security Notes

- **NEVER commit `.env.local` to version control**
- **Keep your API keys secure**
- **Rotate keys regularly**
- **Use different keys for development and production**

### 5. Verify Setup

After creating the file, restart your development server:

```bash
npm start
```

The application should now work without the hardcoded API key errors.

## 🚨 **Troubleshooting**

If you see errors about missing environment variables:

1. Check that `.env.local` exists in the root directory
2. Verify all required variables are set
3. Restart the development server
4. Check the browser console for specific error messages

## 📚 **Additional Resources**

- [Firebase Setup Guide](FIREBASE_SETUP.md)
- [HuggingFace Integration](HUGGINGFACE_INTEGRATION.md)
- [Gemini Setup Guide](GEMINI_SETUP.md)
