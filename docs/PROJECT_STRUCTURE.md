# 🏠 Home Hub - Project Structure

## 📁 Root Directory Structure

```
Home Hub/
├── 📁 api/                          # Backend API server
├── 📁 build/                        # Production build output
├── 📁 coverage/                     # Test coverage reports
├── 📁 docs/                         # 📚 All documentation
│   ├── 📁 architecture/             # System architecture docs
│   ├── 📁 deployment/               # Deployment guides
│   ├── 📁 development/              # Development guides
│   ├── 📁 testing/                  # Testing documentation
│   ├── 📁 api/                      # API documentation
│   ├── 📁 security/                 # Security documentation
│   ├── 📁 enterprise/               # Enterprise features
│   ├── 📁 mobile/                   # Mobile app documentation
│   ├── 📁 analytics/                # Analytics documentation
│   ├── 📁 monitoring/               # Monitoring documentation
│   ├── 📁 performance/              # Performance documentation
│   ├── 📁 quality/                  # Quality assurance
│   └── 📁 changelogs/               # Version changelogs
├── 📁 enterprise/                   # Enterprise configuration
├── 📁 HomeHubMobile/                # React Native mobile app
├── 📁 public/                       # Static assets
├── 📁 scripts/                      # Build and utility scripts
├── 📁 src/                          # Main source code
└── 📄 Configuration files           # Root config files
```

---

## 📁 Source Code Structure (`src/`)

```
src/
├── 📁 components/                   # React components
│   ├── 📁 __tests__/               # Component tests
│   ├── 📁 ai/                      # AI-related components
│   ├── 📁 analytics/               # Analytics components
│   ├── 📁 api/                     # API components
│   ├── 📁 auth/                    # Authentication components
│   ├── 📁 common/                  # Shared components
│   ├── 📁 forms/                   # Form components
│   ├── 📁 i18n/                    # Internationalization
│   ├── 📁 layout/                  # Layout components
│   ├── 📁 mobile/                  # Mobile-specific components
│   ├── 📁 modules/                 # Feature modules
│   ├── 📁 monitoring/              # Monitoring components
│   ├── 📄 ColorPicker.js           # 🎨 Color customization tool
│   ├── 📄 ThemeSettings.js         # 🎨 Theme management interface
│   ├── 📄 ThemePreview.js          # 🎨 Live theme preview component
│   ├── 📁 offline/                 # Offline functionality
│   ├── 📁 pwa/                     # PWA components
│   ├── 📁 security/                # Security components
│   └── 📁 validation/              # Validation components
├── 📁 contexts/                     # React contexts
│   ├── 📁 __mocks__/               # Context mocks for testing
│   └── 📁 __tests__/               # Context tests
├── 📁 firebase/                     # Firebase configuration
├── 📁 hooks/                        # Custom React hooks
├── 📁 i18n/                        # Internationalization
├── 📁 middleware/                   # Middleware functions
├── 📁 modules/                      # Feature modules
├── 📁 pages/                        # Page components
├── 📁 services/                     # Business logic services
├── 📁 styles/                       # CSS and styling
│   ├── 📄 theme-variables.css      # 🎨 CSS custom properties for theming
│   └── 📄 sidebar.css              # Sidebar styling
├── 📁 tests/                        # Test utilities
└── 📁 utils/                        # Utility functions
```

---

## 📁 Documentation Structure (`docs/`)

### Architecture Documentation
- `PROJECT_STRUCTURE.md` - This file
- `PROJECT_OVERVIEW.md` - High-level project overview
- `TECHNICAL_REFERENCE.md` - Technical specifications
- `DATA_STORAGE_GUIDE.md` - Data storage architecture

### Deployment Documentation
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `DEPLOYMENT.md` - Alternative deployment guide
- `FIREBASE_SETUP.md` - Firebase configuration
- `PRODUCTION_READINESS.md` - Production checklist
- `WORKFLOWS_FIXED.md` - CI/CD workflow fixes

### Development Documentation
- `DEVELOPMENT.md` - Development setup
- `SETUP_GUIDE.md` - Initial setup instructions
- `TESTING.md` - Testing guidelines
- `API_REFERENCE.md` - API documentation

### Security Documentation
- `SECURITY_FIXES.md` - Security implementations
- `ENTERPRISE_STANDARDS_IMPLEMENTATION.md` - Enterprise security

### Enterprise Documentation
- `ENTERPRISE_STANDARDS_IMPLEMENTATION.md` - Enterprise features

### Mobile Documentation
- `MOBILE_APP_DEVELOPMENT_SUMMARY.md` - Mobile app overview

### Testing Documentation
- `TEST_STATUS.md` - Current test status

### Changelogs
- `CHANGELOG.md` - Main changelog
- `CHANGELOG_2025-09-29.md` - Specific date changelog

### Guides
- `IMMEDIATE_ACTION_PLAN.md` - Action plan
- `PENDING_ITEMS.md` - Pending items
- `CLEANUP_SUMMARY.md` - Cleanup summary
- `COMPREHENSIVE_PROJECT_ANALYSIS_AND_TODO.md` - Project analysis
- `HOME_REDESIGN_SUMMARY.md` - UI redesign summary
- `ENHANCEMENT_SUMMARY.md` - Enhancement summary
- `MY_PANTRY_TRACKER_ANALYSIS.md` - UI analysis
- `PIAZZA_DOCUMENTATION.md` - Piazza integration
- `WORKING_STATE_README.md` - Working state documentation

---

## 📁 Component Organization

### Core Components (`src/components/`)

#### Layout Components (`layout/`)
- `Navigation.js` - Main navigation component
- `FixedHeader.js` - Fixed header banner
- `MainContentWrapper.js` - Content wrapper
- `Header.js` - Header component
- `DarkModeToggle.js` - Theme toggle

#### Common Components (`common/`)
- `ThemeToggleButton.js` - Reusable theme toggle
- `HelpTooltip.js` - Help tooltips
- `LoadingStates.js` - Loading components
- `ProgressIndicator.js` - Progress indicators

#### Feature Modules (`modules/`)
- `InventoryManagement.js` - Inventory management
- `Spending.js` - Spending tracking
- `RecipeManagement.js` - Recipe management
- `ShoppingLists.js` - Shopping lists
- `Collaboration.js` - Real-time collaboration
- `AISuggestions.js` - AI suggestions
- `AnalyticsDashboard.js` - Analytics
- `UserAccessManagement.js` - User management
- `Settings.js` - Settings

#### Authentication (`auth/`)
- `AuthPage.js` - Authentication page
- `AuthSystem.js` - Auth system
- `SimpleAuthProvider.js` - Simple auth provider

#### AI Components (`ai/`)
- AI-related components for suggestions and automation

#### Analytics (`analytics/`)
- Analytics dashboard and reporting components

---

## 📁 Service Layer (`src/services/`)

### Core Services
- `AuthService.js` - Authentication service
- `InventoryService.js` - Inventory management
- `SpendingService.js` - Financial tracking
- `RecipeService.js` - Recipe management
- `ShoppingService.js` - Shopping lists
- `CollaborationService.js` - Real-time collaboration
- `AIService.js` - AI functionality
- `AnalyticsService.js` - Analytics
- `UserService.js` - User management
- `SettingsService.js` - Settings management

### Utility Services
- `DeviceService.js` - Device tracking
- `UPCDatabaseService.js` - Barcode database
- `StorageService.js` - Data storage
- `NotificationService.js` - Notifications
- `ValidationService.js` - Data validation

---

## 📁 Context Providers (`src/contexts/`)

### Core Contexts
- `AuthContext.js` - Authentication state
- `ThemeContext.js` - Theme management
- `DevToolsContext.js` - Development tools
- `RealTimeContext.js` - Real-time features
- `OfflineContext.js` - Offline functionality
- `LanguageContext.js` - Internationalization
- `AnalyticsContext.js` - Analytics
- `MonitoringContext.js` - Monitoring
- `SecurityContext.js` - Security
- `ValidationContext.js` - Validation

### Test Mocks (`__mocks__/`)
- `AuthContext.js` - Auth context mock
- `DevToolsContext.js` - DevTools context mock
- `RealTimeContext.js` - RealTime context mock

---

## 📁 Mobile App (`HomeHubMobile/`)

```
HomeHubMobile/
├── 📁 src/
│   ├── 📁 contexts/                # Mobile contexts
│   └── 📁 screens/                 # Mobile screens
├── 📁 assets/                      # Mobile assets
├── 📄 App.tsx                      # Mobile app entry
├── 📄 app.json                     # App configuration
└── 📄 package.json                 # Mobile dependencies
```

---

## 📁 API Server (`api/`)

```
api/
├── 📁 src/
│   ├── 📁 config/                  # API configuration
│   ├── 📁 middleware/              # API middleware
│   ├── 📁 routes/                  # API routes
│   └── 📁 services/                # API services
├── 📄 server.js                    # API server entry
├── 📄 package.json                 # API dependencies
└── 📄 FIREBASE_SETUP.md            # Firebase setup
```

---

## 📁 Enterprise Configuration (`enterprise/`)

```
enterprise/
├── 📁 deployment/                  # Deployment configs
├── 📁 monitoring/                  # Monitoring configs
├── 📁 quality/                     # Quality gates
├── 📁 security/                    # Security policies
└── 📄 package.json                 # Enterprise dependencies
```

---

## 📁 Scripts (`scripts/`)

- `cleanup-merged-branches.sh` - Git branch cleanup
- `cleanup-remote-branches.sh` - Remote branch cleanup
- `optimize-production.js` - Production optimization
- `update-todo.js` - TODO management

---

## 📁 Configuration Files

### Root Configuration
- `package.json` - Main project dependencies
- `jest.config.js` - Testing configuration
- `tailwind.config.js` - Tailwind CSS config
- `cypress.config.js` - E2E testing config
- `postcss.config.js` - PostCSS config
- `docker-compose.yml` - Docker configuration
- `Dockerfile` - Docker image definition

### Firebase Configuration
- `firebase-security-rules.json` - Firestore security rules
- `firestore.rules` - Firestore rules

---

## 🎯 Key Principles

### 1. **Separation of Concerns**
- Components handle UI logic
- Services handle business logic
- Contexts manage state
- Utils provide helper functions

### 2. **Modular Architecture**
- Feature-based organization
- Reusable components
- Shared services
- Independent modules

### 3. **Testability**
- Comprehensive test coverage
- Mock providers for contexts
- Isolated component testing
- Service layer testing

### 4. **Maintainability**
- Clear file organization
- Consistent naming conventions
- Comprehensive documentation
- Regular cleanup

### 5. **Scalability**
- Modular design
- Service-oriented architecture
- Context-based state management
- Lazy loading support

---

## 📝 File Naming Conventions

### Components
- `PascalCase.js` - React components
- `camelCase.js` - Utility functions
- `kebab-case.js` - Configuration files

### Folders
- `camelCase/` - Feature folders
- `PascalCase/` - Component folders
- `lowercase/` - Utility folders

### Tests
- `ComponentName.test.js` - Component tests
- `serviceName.test.js` - Service tests
- `__tests__/` - Test directories

---

*Last Updated: January 2025*
*Maintained by: Home Hub Development Team*
