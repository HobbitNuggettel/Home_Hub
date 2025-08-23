# ⚙️ Home Hub - Complete Setup Guide

This comprehensive guide covers all setup and configuration requirements for the Home Hub project, consolidating information from multiple setup files.

---

## 🚀 **QUICK START**

### **Prerequisites**
- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher (or yarn)
- **Git**: For version control
- **Code Editor**: VS Code recommended

### **Installation Steps**
```bash
# Clone the repository
git clone <repository-url>
cd home-hub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm start
```

---

## 🔧 **ENVIRONMENT SETUP**

### **Required Environment Variables**
Create a `.env.local` file in the project root with the following variables:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# AI Services
REACT_APP_HUGGINGFACE_API_KEY=your_huggingface_key
REACT_APP_GEMINI_API_KEY=your_gemini_key

# Optional: Development Settings
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG_MODE=true
```

### **Environment Variable Validation**
The application validates environment variables on startup. Missing required variables will show clear error messages.

---

## 🔥 **FIREBASE SETUP**

### **1. Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "home-hub")
4. Choose whether to enable Google Analytics
5. Click "Create project"

### **2. Configure Authentication**
1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Email/Password" authentication
3. Optionally enable "Google" authentication
4. Configure authorized domains

### **3. Set Up Firestore Database**
1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" for development
3. Select a location close to your users
4. Create the database

### **4. Configure Storage**
1. Go to "Storage" → "Get started"
2. Choose "Start in test mode" for development
3. Select a location (same as Firestore)

### **5. Get Configuration**
1. Go to "Project settings" → "General"
2. Scroll down to "Your apps"
3. Click the web app icon (</>)
4. Register app with a nickname
5. Copy the configuration object

### **6. Security Rules**
Update Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read/write household data
    match /households/{householdId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🧠 **AI SERVICES SETUP**

### **HuggingFace Integration**

#### **1. Get API Key**
1. Go to [HuggingFace](https://huggingface.co/)
2. Create an account or sign in
3. Go to "Settings" → "Access Tokens"
4. Create a new token with "read" permissions
5. Copy the token

#### **2. Configure Models**
The application uses these HuggingFace models:
- **Text Classification**: For expense categorization
- **Text Generation**: For AI responses
- **Translation**: For multi-language support

#### **3. API Configuration**
```javascript
// Example configuration in your AI service
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';
const MODEL_NAME = 'your-preferred-model';
```

### **Google Gemini Integration**

#### **1. Get API Key**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

#### **2. Enable Gemini API**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Library"
4. Search for "Gemini API"
5. Click "Enable"

#### **3. Configure Gemini Service**
```javascript
// Example configuration
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
```

---

## 🧪 **TESTING SETUP**

### **Test Environment Configuration**
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- --testPathPattern=ComponentName.test.js
```

### **Test Configuration Files**
- **jest.config.js**: Jest testing framework configuration
- **setupTests.js**: Global test setup and mocks
- **test-utils.js**: Custom test utilities and helpers

### **Testing Dependencies**
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.16.0",
    "@testing-library/user-event": "^14.0.0",
    "jest": "^27.0.0"
  }
}
```

---

## 🚀 **DEVELOPMENT SERVER**

### **Available Scripts**
```bash
# Start development server
npm start

# Build for production
npm run build

# Eject from Create React App
npm run eject

# Analyze bundle size
npm run analyze
```

### **Development Server Features**
- **Hot Reloading**: Automatic page refresh on code changes
- **Error Overlay**: Clear error messages in browser
- **Source Maps**: Easy debugging with original source code
- **Environment Variables**: Automatic loading of .env.local

---

## 📱 **PROGRESSIVE WEB APP (PWA)**

### **PWA Configuration**
The application is configured as a Progressive Web App with:
- **Service Worker**: Offline functionality
- **Web App Manifest**: Installable on mobile devices
- **Responsive Design**: Optimized for all screen sizes

### **PWA Features**
- **Offline Support**: Basic functionality without internet
- **Installable**: Add to home screen on mobile
- **Fast Loading**: Optimized performance and caching
- **Push Notifications**: Real-time updates (future feature)

---

## 🔒 **SECURITY CONFIGURATION**

### **Content Security Policy (CSP)**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://api.firebase.com https://api.huggingface.co;">
```

### **Environment Variable Security**
- **Never commit .env.local** to version control
- **Use .env.example** for template values
- **Validate variables** on application startup
- **Rotate API keys** regularly

### **Firebase Security Rules**
- **Authentication required** for all data access
- **User isolation** for sensitive data
- **Input validation** on client and server
- **Rate limiting** for API calls

---

## 🐛 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Environment Variables Not Loading**
```bash
# Check if .env.local exists
ls -la .env.local

# Verify variable names start with REACT_APP_
echo $REACT_APP_FIREBASE_API_KEY

# Restart development server
npm start
```

#### **2. Firebase Connection Issues**
```bash
# Verify API key is correct
# Check if project is in correct region
# Ensure Firestore rules allow access
# Check browser console for CORS errors
```

#### **3. AI Service Errors**
```bash
# Verify API keys are valid
# Check API quotas and limits
# Ensure models are available
# Check network connectivity
```

#### **4. Test Failures**
```bash
# Clear Jest cache
npm test -- --clearCache

# Check test environment setup
# Verify all mocks are properly configured
# Check for missing dependencies
```

---

## 📚 **ADDITIONAL RESOURCES**

### **Documentation**
- **[Firebase Documentation](https://firebase.google.com/docs)**
- **[HuggingFace API Docs](https://huggingface.co/docs/api-inference)**
- **[Google Gemini API Docs](https://ai.google.dev/docs)**
- **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro)**

### **Community Support**
- **GitHub Issues**: Report bugs and request features
- **Stack Overflow**: Search for common solutions
- **Discord Community**: Real-time help and discussion

---

## ✅ **SETUP CHECKLIST**

### **Pre-Installation**
- [ ] Node.js 16+ installed
- [ ] npm or yarn available
- [ ] Git configured
- [ ] Code editor ready

### **Environment Setup**
- [ ] .env.local file created
- [ ] Firebase API keys configured
- [ ] AI service API keys configured
- [ ] Environment variables validated

### **Firebase Configuration**
- [ ] Project created
- [ ] Authentication enabled
- [ ] Firestore database created
- [ ] Storage configured
- [ ] Security rules updated

### **AI Services**
- [ ] HuggingFace API key obtained
- [ ] Gemini API key obtained
- [ ] API services enabled
- [ ] Models configured

### **Testing**
- [ ] Test dependencies installed
- [ ] Test configuration verified
- [ ] Sample tests passing
- [ ] Coverage reporting working

### **Development**
- [ ] Development server starts
- [ ] Hot reloading working
- [ ] Build process successful
- [ ] PWA features functional

---

**Last Updated**: December 2024  
**Status**: 🚀 **COMPLETE SETUP GUIDE READY!** ⚙️

---

> 💡 **Pro Tip**: Follow this checklist step by step to ensure a smooth setup experience. If you encounter issues, check the troubleshooting section or refer to the community resources!
