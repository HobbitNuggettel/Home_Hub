# 🚀 Environment Setup Guide - Home Hub

## 📋 **Prerequisites**
- Node.js 16+ and npm
- Firebase project created
- Git repository initialized

---

## 🔥 **Firebase Configuration**

### **1. Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `Home Hub`
4. Enable Google Analytics (recommended)
5. Click **"Create project"**

### **2. Enable Firebase Services**
```bash
# In Firebase Console, enable these services:
✅ Authentication
✅ Firestore Database  
✅ Storage (optional - we use hybrid approach)
✅ Analytics
✅ Hosting
```

### **3. Get Firebase Config**
1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click **"Add app"** → **Web app**
4. Register app with name: `Home Hub Web`
5. Copy the config object

### **4. Environment Variables**
Create `.env` file in project root:
```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Firebase Storage (if you want to use it)
REACT_APP_FIREBASE_STORAGE_ENABLED=false
```

---

## 🖼️ **Imgur API Setup (FREE)**

### **1. Get Imgur API Key**
1. Go to [https://api.imgur.com/oauth2/addclient](https://api.imgur.com/oauth2/addclient)
2. **Application name**: `Home Hub`
3. **Authorization type**: `OAuth 2 authorization with a callback URL`
4. **Authorization callback URL**: `http://localhost:3000/auth/imgur/callback`
5. **Application website**: `http://localhost:3000`
6. **Email**: Your email
7. **Description**: `Home Hub image storage service`
8. Click **Submit**

### **2. Add to Environment**
```bash
# Add to .env file:
REACT_APP_IMGUR_CLIENT_ID=your_client_id_here
```

### **3. Imgur Free Tier Limits**
- ✅ **Daily uploads**: 1,250 images/day
- ✅ **File size**: Up to 10MB per image
- ✅ **Storage**: Unlimited
- ✅ **Bandwidth**: Unlimited

---

## ☁️ **Cloudinary Setup (FREE)**

### **1. Create Cloudinary Account**
1. Go to [Cloudinary Sign Up](https://cloudinary.com/users/register/free)
2. Sign up with email
3. Verify email address
4. Log in to dashboard

### **2. Get Account Details**
1. In dashboard, note your **Cloud Name**
2. Go to **Settings** → **Upload**
3. Scroll to **Upload presets**
4. Click **"Add upload preset"**
5. Set **Preset name**: `home_hub_upload`
6. Set **Signing Mode**: `Unsigned`
7. Click **Save**

### **3. Add to Environment**
```bash
# Add to .env file:
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=home_hub_upload
```

### **4. Cloudinary Free Tier Limits**
- ✅ **Storage**: 25GB
- ✅ **Bandwidth**: 25GB/month
- ✅ **File size**: Up to 100MB
- ✅ **Transformations**: Basic transformations

---

## 🧠 **AI Services Setup**

### **1. HuggingFace (FREE)**
```bash
# Add to .env file:
REACT_APP_HUGGINGFACE_API_KEY=your_api_key_here
```

**Get API Key:**
1. Go to [HuggingFace](https://huggingface.co/settings/tokens)
2. Click **"New token"**
3. Enter name: `Home Hub AI`
4. Select **Read** role
5. Copy token

### **2. Google Gemini (FREE)**
```bash
# Add to .env file:
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

**Get API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the key

### **3. OpenAI (PAID)**
```bash
# Add to .env file:
REACT_APP_OPENAI_API_KEY=your_api_key_here
```

**Get API Key:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click **"Create new secret key"**
3. Copy the key

---

## 🔐 **Authentication Setup**

### **1. Firebase Auth Methods**
In Firebase Console → Authentication → Sign-in method:

```bash
✅ Email/Password
✅ Google
✅ Facebook
✅ Twitter
✅ GitHub
✅ Phone
```

### **2. OAuth Setup**

#### **Google OAuth**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Add authorized origins: `http://localhost:3000`
6. Add authorized redirect URIs: `http://localhost:3000/auth/google/callback`

#### **Facebook OAuth**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app
3. Add **Facebook Login** product
4. Set OAuth redirect URIs: `http://localhost:3000/auth/facebook/callback`

#### **GitHub OAuth**
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Set **Authorization callback URL**: `http://localhost:3000/auth/github/callback`

---

## 📱 **PWA Configuration**

### **1. Manifest Settings**
Update `public/manifest.json`:
```json
{
  "name": "Home Hub",
  "short_name": "HomeHub",
  "description": "Smart home management platform",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "logo192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "logo512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### **2. Service Worker**
The service worker is already configured in `public/sw.js`

---

## 🚀 **Installation & Setup**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Environment File**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your actual values
nano .env
```

### **3. Firebase Initialization**
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Select services:
✅ Firestore
✅ Authentication  
✅ Hosting
✅ Analytics
```

### **4. Deploy Security Rules**
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firebase functions (if any)
firebase deploy --only functions
```

---

## 🧪 **Testing Setup**

### **1. Run Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- --testPathPattern=ImageManagement.test.js
```

### **2. Test Coverage**
```bash
# Generate coverage report
npm test -- --coverage --watchAll=false
```

---

## 📊 **Monitoring & Analytics**

### **1. Firebase Analytics**
- View in Firebase Console → Analytics
- Track user engagement, app performance
- Monitor custom events

### **2. Service Health**
```javascript
// Check service status
import { imageManagementService } from './src/services/ImageManagementService';

const status = await imageManagementService.healthCheck();
console.log('Service Status:', status);
```

### **3. Usage Monitoring**
```javascript
// Monitor free tier usage
import { hybridFirebaseStorage } from './src/firebase/hybridStorage';

const usage = hybridFirebaseStorage.getUsageStats();
console.log('Firebase Usage:', usage);
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. Firebase Connection Failed**
```bash
# Check environment variables
echo $REACT_APP_FIREBASE_API_KEY

# Verify Firebase project ID
# Check internet connection
# Verify API key permissions
```

#### **2. Imgur Upload Failed**
```bash
# Check daily limit
# Verify CLIENT_ID in .env
# Check file size (max 10MB)
# Verify file type (images only)
```

#### **3. Cloudinary Upload Failed**
```bash
# Check monthly storage limit
# Verify CLOUD_NAME and UPLOAD_PRESET
# Check file size (max 100MB)
# Verify upload preset is unsigned
```

#### **4. AI Services Not Working**
```bash
# Check API keys in .env
# Verify API quotas
# Check internet connection
# Verify service endpoints
```

---

## 📈 **Performance Optimization**

### **1. Image Compression**
- Automatic compression before upload
- Multiple quality levels for fallback
- WebP format support

### **2. Caching Strategy**
- Service worker for offline support
- Local storage for usage tracking
- Intelligent retry mechanisms

### **3. Rate Limiting**
- Respect API limits
- Queue management for bulk uploads
- Exponential backoff for retries

---

## 🔒 **Security Considerations**

### **1. Environment Variables**
```bash
# Never commit .env files
# Use .env.local for local development
# Use .env.production for production
```

### **2. API Key Security**
- Rotate keys regularly
- Use environment variables
- Monitor API usage
- Set up alerts for unusual activity

### **3. Firebase Security Rules**
- Test rules thoroughly
- Use least privilege principle
- Monitor access patterns
- Regular security audits

---

## 🚀 **Deployment Checklist**

### **Production Deployment**
```bash
✅ Environment variables set
✅ Firebase project configured
✅ Security rules deployed
✅ OAuth providers configured
✅ API keys secured
✅ SSL certificates valid
✅ Domain configured
✅ Analytics enabled
✅ Error monitoring setup
✅ Performance monitoring active
```

### **Post-Deployment**
```bash
✅ Test all authentication methods
✅ Verify image uploads work
✅ Check AI services functionality
✅ Monitor error logs
✅ Verify analytics tracking
✅ Test PWA installation
✅ Check offline functionality
```

---

## 📚 **Additional Resources**

### **Documentation**
- [Firebase Documentation](https://firebase.google.com/docs)
- [Imgur API Documentation](https://apidocs.imgur.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [HuggingFace API Docs](https://huggingface.co/docs/api-inference)
- [Google AI Studio](https://makersuite.google.com/)

### **Support**
- Firebase Support: [Firebase Help](https://firebase.google.com/support)
- Imgur Support: [Imgur Help](https://help.imgur.com/)
- Cloudinary Support: [Cloudinary Help](https://support.cloudinary.com/)

---

## 🎯 **Next Steps**

1. **Complete Environment Setup** - Follow this guide step by step
2. **Test All Services** - Verify each service works independently
3. **Integration Testing** - Test services working together
4. **Performance Testing** - Monitor upload speeds and reliability
5. **Security Testing** - Verify all security measures work
6. **User Testing** - Get feedback on user experience
7. **Production Deployment** - Deploy to production environment

---

**🎉 Congratulations!** You now have a fully configured Home Hub environment with:
- 🔥 Firebase backend (FREE tier optimized)
- 🖼️ Imgur image hosting (1,250 uploads/day FREE)
- ☁️ Cloudinary image optimization (25GB/month FREE)
- 🧠 AI services integration
- 🔐 Multi-provider authentication
- 📱 PWA capabilities
- 📊 Comprehensive analytics

Your Home Hub is ready to scale from free tier to enterprise! 🚀
