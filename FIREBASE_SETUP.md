# 🔥 Firebase Setup Guide

## 📋 **Environment Variables Setup**

To use your own Firebase project instead of the fallback values, create a `.env.local` file in the root directory:

### 1. **Create .env.local file**
```bash
# In your project root directory
touch .env.local
```

### 2. **Add Firebase credentials to .env.local**
```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_actual_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. **Get your Firebase credentials**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ → "Project settings"
4. Scroll down to "Your apps" section
5. Click on your web app (or create one)
6. Copy the config values

### 4. **Restart development server**
```bash
npm start
```

## 🚨 **Important Notes**

- **Never commit .env.local to git** (it's already in .gitignore)
- **Restart your dev server** after creating .env.local
- **Current fallback values** are for development only
- **Environment variables must start with REACT_APP_** for Create React App

## 🔧 **Current Fallback Values**

The app currently uses these fallback values from `src/firebase/config.js`:
- Project: `home-hub-app-18bcf`
- These are development-only and should be replaced for production

## ✅ **Verification**

After setup, you should see:
- Your Firebase project ID in the console
- Authentication working with your project
- Firestore database connected to your project

---

**Need help?** Check the [Firebase documentation](https://firebase.google.com/docs/web/setup) for detailed setup instructions.
