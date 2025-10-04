# 🔧 Technical Reference - Home Hub

**Last Updated:** September 29, 2025  
**Branch:** feature-development-20250929

---

## 📊 Quick Stats

| Metric | Value | Status |
|--------|-------|--------|
| Total Files | 200+ | ✅ |
| React Components | 100+ | ✅ |
| API Endpoints | 50+ | ✅ |
| Test Suite | 261 tests | 🔄 73% passing |
| Bundle Size | 401kB gzipped | ✅ |
| ESLint Errors | 4 (accessibility) | 🔄 |
| Build Status | Clean | ✅ |

---

## 🏗️ Architecture Patterns

### **1. Service Layer Pattern**

All external integrations use a service abstraction:

```javascript
// Example: Image Management Service with Fallbacks
ImageManagementService
├── Cloudinary (Primary)
├── Imgur (Secondary)
└── Base64 (Fallback)
```

**Benefits:**
- Loose coupling
- Easy testing with mocks
- Graceful degradation
- Centralized error handling

### **2. Context + Hooks Pattern**

State management via React Context and custom hooks:

```javascript
// Context Providers
AuthContext          // User authentication
RealTimeContext      // Live collaboration
DevToolsContext      // Development tools
ThemeContext         // UI theming

// Custom Hooks
useInventory()       // Inventory management
useSpending()        // Financial tracking
useAuthRedirect()    // Auth flow control
```

### **3. API Fallback Strategy**

**3-Tier Fallback System:**

```
Primary Service
    ↓ (on failure)
Secondary Service
    ↓ (on failure)
Local Fallback
```

**Example - AI Services:**
```javascript
tryHuggingFace()
    ↓ (503/timeout)
tryGemini()
    ↓ (failure)
tryLocalCache()
```

---

## 🔥 Firebase Integration

### **Collections Structure**

```
users/{userId}
├── profile              // User profile data
├── inventory/          
│   └── items/{itemId}  // Inventory items
├── spending/
│   └── expenses/{id}   // Expense records
├── recipes/
│   └── items/{id}      // Recipe data
└── smartHome/
    └── devices/{id}    // Smart devices
```

### **Security Rules**

```javascript
// Firestore Rules
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
  
  match /inventory/{itemId} {
    allow read, write: if request.auth.uid == userId;
  }
}
```

### **Hybrid Storage Strategy**

```javascript
// Image Storage Priority
1. Cloudinary (if configured)
2. Imgur (if configured)  
3. Firebase Storage (if enabled)
4. Base64 (always available)
```

---

## 🚀 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Token verification

### **Inventory**
- `GET /api/inventory` - List all items
- `POST /api/inventory` - Create item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item
- `GET /api/inventory/stats` - Get statistics

### **Spending**
- `GET /api/spending` - List expenses
- `POST /api/spending` - Add expense
- `PUT /api/spending/:id` - Update expense
- `DELETE /api/spending/:id` - Delete expense
- `GET /api/spending/analytics` - Get analytics

### **Analytics**
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/spending` - Spending analytics
- `GET /api/analytics/inventory` - Inventory analytics
- `POST /api/analytics/custom` - Custom analytics

### **Real-time (WebSocket)**
- `connection` - Client connects
- `join_room` - Join collaboration room
- `leave_room` - Leave room
- `data_update` - Sync data changes
- `user_presence` - Update presence

---

## 🧪 Testing Strategy

### **Test Organization**

```
src/
├── components/__tests__/       # Component tests
├── contexts/__tests__/         # Context tests
├── services/__tests__/         # Service tests
└── utils/__tests__/            # Utility tests
```

### **Test Utilities**

```javascript
// Custom render with providers
renderWithProviders(component, options)

// Mock contexts
MockAuthProvider
MockRealTimeProvider
MockThemeProvider
```

### **Known Test Issues**

1. **AuthContext Mock Issues** (71 failing tests)
   - Cause: Missing useAuth() mock in some tests
   - Fix: Use renderWithProviders consistently

2. **Firebase Test Setup**
   - ReadableStream polyfill needed
   - Fixed in setupTests.js

3. **Router Warnings**
   - Fixed with future flags
   - v7 compatibility ready

---

## ⚡ Performance Optimizations

### **1. Code Splitting**

```javascript
// Lazy load heavy components
const AdvancedAnalytics = lazy(() => 
  import('./components/AdvancedAnalytics')
);
const AIAssistant = lazy(() => 
  import('./components/AIAssistant')
);
```

### **2. Caching Strategy**

```javascript
// Multi-level caching
CacheService
├── Memory Cache (instant)
├── LocalStorage (persistent)
└── API Cache (conditional)
```

### **3. Image Optimization**

```javascript
// Automatic compression
ImageCompressionService
├── Quality levels: [0.9, 0.8, 0.6]
├── Max size: 500KB
└── Format: WebP preferred
```

### **4. Bundle Optimization**

- Tree shaking enabled
- Dynamic imports for routes
- Vendor chunk splitting
- CSS minification
- Gzip compression

---

## 🔒 Security Implementation

### **1. Authentication Flow**

```javascript
// Firebase Auth + Custom Tokens
User Login
    ↓
Firebase Authentication
    ↓
Custom Token Generation
    ↓
JWT for API Access
    ↓
Protected Routes
```

### **2. API Security**

```javascript
// Express Middleware Stack
Request
    ↓
Helmet (Security Headers)
    ↓
CORS (Origin Control)
    ↓
Rate Limiting
    ↓
JWT Verification
    ↓
Input Validation
    ↓
Route Handler
```

### **3. Data Validation**

```javascript
// Using express-validator + zod
express-validator (API layer)
zod schemas (Form validation)
React Hook Form (UI validation)
```

---

## 🔄 State Management Flow

### **Global State (Contexts)**

```javascript
AuthContext
├── currentUser
├── userProfile
├── login()
├── logout()
└── updateProfile()

RealTimeContext
├── activities
├── activeUsers
├── connect()
├── disconnect()
└── syncData()
```

### **Local State (Hooks)**

```javascript
useInventory()
├── items []
├── loading
├── error
├── addItem()
├── updateItem()
├── deleteItem()
└── searchItems()
```

### **Form State (React Hook Form)**

```javascript
// Optimized form handling
const { register, handleSubmit, formState } = useForm({
  mode: 'onChange',
  resolver: zodResolver(schema)
});
```

---

## 🐛 Error Handling

### **Error Boundary Structure**

```javascript
App
└── ErrorBoundary (Global)
    ├── ModuleErrorBoundary (Per Module)
    │   └── ComponentErrorBoundary (Critical Components)
    └── Fallback UI with Recovery Options
```

### **Error Logging**

```javascript
// Centralized error logging
ErrorService
├── Console logging (dev)
├── Firebase Analytics (prod)
├── User notifications (UI)
└── Recovery suggestions
```

---

## 📱 Mobile Architecture

### **Navigation Structure**

```javascript
// React Navigation
TabNavigator (Main)
├── Home Tab
├── Inventory Tab
├── Spending Tab
├── Analytics Tab
└── Settings Tab

StackNavigator (Auth)
├── Login Screen
└── Register Screen
```

### **Offline Support**

```javascript
// Network-aware architecture
NetworkContext
├── isConnected (boolean)
├── connectionType (wifi/cellular)
└── syncQueue (pending operations)

AsyncStorage
├── User data cache
├── Pending operations
└── Last sync timestamp
```

---

## 🔧 Development Tools

### **DevTools Panel**

```javascript
// In-app development tools
DevToolsContext
├── isDevMode (toggle)
├── showDevTools (panel)
├── performanceMetrics()
└── cacheInspector()
```

### **Performance Monitoring**

```javascript
// Real-time performance tracking
PerformanceMonitor
├── Component render times
├── API response times
├── Memory usage
├── Cache hit rates
└── Network requests
```

---

## 🚀 Deployment Checklist

### **Pre-Deployment**

```bash
# ✅ Run tests
npm test

# ✅ Lint code
npm run lint

# ✅ Build production
npm run build

# ✅ Check bundle size
npm run analyze

# ✅ Security audit
npm audit

# ✅ Environment variables
# Verify all required vars are set

# ✅ Firebase configuration
# Test connection and rules

# ✅ API health check
# Verify all endpoints respond
```

### **Post-Deployment**

```bash
# ✅ Monitor error logs
# Check Firebase Console

# ✅ Performance metrics
# Review analytics dashboard

# ✅ User feedback
# Monitor support channels

# ✅ Database health
# Check Firestore metrics

# ✅ API uptime
# Verify endpoint availability
```

---

## 📦 Dependency Management

### **Critical Dependencies**

```json
{
  "react": "^18.2.0",           // Core framework
  "firebase": "^10.14.1",       // Backend
  "express": "^5.1.0",          // API server
  "socket.io": "^4.8.1",        // Real-time
  "chart.js": "^4.5.0",         // Visualizations
  "tailwindcss": "^3.3.0"       // Styling
}
```

### **Update Strategy**

- **Major updates**: Quarterly review
- **Minor updates**: Monthly
- **Security patches**: Immediate
- **Dev dependencies**: As needed

---

## 🎯 Common Issues & Solutions

### **1. Firebase Connection Issues**

```javascript
// Solution: Check .env.local configuration
// Verify Firebase project settings
// Ensure security rules are correct
```

### **2. Build Errors**

```bash
# Clear cache and rebuild
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

### **3. Test Failures**

```javascript
// Use renderWithProviders for all component tests
// Ensure mocks are properly set up
// Check for missing dependencies in test files
```

### **4. API Timeout**

```javascript
// Implement exponential backoff
// Use fallback services
// Add request timeouts
// Cache responses when possible
```

---

## 📚 Code Examples

### **Adding a New Feature Module**

```javascript
// 1. Create component
src/components/modules/NewFeature.js

// 2. Add route
src/App.js
<Route path="/new-feature" element={<NewFeature />} />

// 3. Add navigation
src/components/Navigation.js
<NavLink to="/new-feature">New Feature</NavLink>

// 4. Add API endpoint (optional)
api/src/routes/newFeature.js

// 5. Add tests
src/components/__tests__/NewFeature.test.js

// 6. Update documentation
docs/API_REFERENCE.md
```

### **Creating a New Service**

```javascript
// Pattern: Service with fallbacks
class NewService {
  constructor() {
    this.primaryProvider = new PrimaryProvider();
    this.fallbackProvider = new FallbackProvider();
  }

  async performAction(data) {
    try {
      return await this.primaryProvider.action(data);
    } catch (error) {
      console.warn('Primary failed, using fallback');
      return await this.fallbackProvider.action(data);
    }
  }
}

export const newService = new NewService();
```

---

## 🔗 Useful Links

- **Firebase Console**: https://console.firebase.google.com/
- **API Documentation**: http://localhost:5000/api-docs
- **React Documentation**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Technical Reference - Home Hub Development Team** 🚀
