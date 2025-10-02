import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { DevToolsProvider } from './contexts/DevToolsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { RealTimeProvider } from './contexts/RealTimeContext';
import { MonitoringProvider } from './contexts/MonitoringContext';
import { ValidationProvider } from './contexts/ValidationContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { SafariCompatibility, SafariErrorBoundary, ErrorBoundary } from './components/common';
import { initializePWA } from './utils/serviceWorker';
import './i18n';

// Lazy load components for better performance
const LandingPage = lazy(() => import('./components/LandingPage'));
const Settings = lazy(() => import('./components/Settings'));
const Home = lazy(() => import('./components/Home'));
const Navigation = lazy(() => import('./components/layout/Navigation'));
const MainContentWrapper = lazy(() => import('./components/layout/MainContentWrapper'));
const TestLogin = lazy(() => import('./components/TestLogin'));
const ThemeTest = lazy(() => import('./components/ThemeTest'));
const Login = lazy(() => import('./components/auth/Login'));
const SignUp = lazy(() => import('./components/auth/SignUp'));
const Inventory = lazy(() => import('./modules/inventory/InventoryManagement'));
const Spending = lazy(() => import('./modules/spending/SpendingTracker'));
const Collaboration = lazy(() => import('./modules/collaboration/RealTimeCollaboration'));
const ShoppingLists = lazy(() => import('./components/modules/ShoppingLists'));
const Recipes = lazy(() => import('./components/modules/Recipes'));
const Integrations = lazy(() => import('./modules/integrations/IntegrationsAutomation'));
const DataAlerts = lazy(() => import('./components/modules/DataAlerts'));
const About = lazy(() => import('./components/modules/About'));
const ImageManagement = lazy(() => import('./components/modules/ImageManagement'));
const AISuggestions = lazy(() => import('./components/modules/AISuggestions'));
const Maintenance = lazy(() => import('./components/modules/Maintenance'));
const Profile = lazy(() => import('./components/Profile'));
const UserAccessManagement = lazy(() => import('./components/UserAccessManagement'));
const AdvancedAnalytics = lazy(() => import('./modules/analytics/AdvancedAnalytics'));
const PerformanceAnalytics = lazy(() => import('./modules/analytics/PerformanceAnalytics'));
const MonitoringDashboard = lazy(() => import('./components/monitoring/MonitoringDashboard'));
const VersionManagement = lazy(() => import('./components/api/VersionManagement'));
const ValidationDashboard = lazy(() => import('./components/validation/ValidationDashboard'));
const OfflineDataManager = lazy(() => import('./components/offline/OfflineDataManager'));
const OfflineIndicator = lazy(() => import('./components/offline/OfflineIndicator'));
const PWASettings = lazy(() => import('./components/pwa/PWASettings'));
const PWAInstallPrompt = lazy(() => import('./components/pwa/PWAInstallPrompt'));
const PWAUpdateNotification = lazy(() => import('./components/pwa/PWAInstallPrompt').then(module => ({ default: module.PWAUpdateNotification })));
const AnalyticsDashboard = lazy(() => import('./components/analytics/AnalyticsDashboard'));
const ColorPicker = lazy(() => import('./components/ColorPicker'));
const EnterpriseDashboard = lazy(() => import('./components/enterprise/EnterpriseDashboard'));

import LogoutTest from './components/LogoutTest';

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  // Initialize PWA features
  React.useEffect(() => {
    initializePWA();
  }, []);

  return (
    <ErrorBoundary>
      <SafariErrorBoundary>
        <SafariCompatibility>
          <ThemeProvider>
            <DevToolsProvider>
              <AuthProvider>
                <RealTimeProvider>
                  <MonitoringProvider>
                    <ValidationProvider>
                      <OfflineProvider>
                        <LanguageProvider>
                          <AnalyticsProvider>
            <Router>
              <div className="App">
                                <Suspense fallback={<LoadingSpinner />}>
                                  <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/logout-test" element={<LogoutTest />} />

                  {/* Protected Routes */}
                  <Route path="/home" element={
                    <>
                                        <Navigation />
                      <Home />
                    </>
                  } />
                                    <Route path="/settings" element={
                                      <>
                                        <Navigation />
                                        <Settings />
                                      </>
                                    } />
                  <Route path="/profile" element={
                    <>
                      <Navigation />
                      <Profile />
                    </>
                  } />

                  {/* Module Routes */}
                  <Route path="/inventory" element={
                    <>
                      <Navigation />
                                        <MainContentWrapper>
                                          <Inventory />
                                        </MainContentWrapper>
                    </>
                  } />
                  <Route path="/spending" element={
                    <>
                      <Navigation />
                                        <MainContentWrapper>
                                          <Spending />
                                        </MainContentWrapper>
                    </>
                  } />
                  <Route path="/collaboration" element={
                    <>
                                        <Navigation />
                                        <Collaboration />
                    </>
                  } />
                  <Route path="/shopping-lists" element={
                    <>
                      <Navigation />
                      <ShoppingLists />
                    </>
                  } />
                  <Route path="/recipes" element={
                    <>
                      <Navigation />
                      <Recipes />
                    </>
                  } />
                  <Route path="/integrations" element={
                    <>
                      <Navigation />
                      <Integrations />
                    </>
                  } />
                  <Route path="/data-alerts" element={
                    <>
                      <Navigation />
                      <DataAlerts />
                    </>
                  } />
                  <Route path="/about" element={
                    <>
                      <Navigation />
                      <About />
                    </>
                  } />
                  <Route path="/image-management" element={
                    <>
                      <Navigation />
                      <ImageManagement />
                    </>
                  } />
                  <Route path="/ai-suggestions" element={
                    <>
                      <Navigation />
                      <AISuggestions />
                    </>
                  } />
                  <Route path="/maintenance" element={
                    <>
                      <Navigation />
                      <Maintenance />
                    </>
                  } />

                  {/* Phase 2: Real-time Collaboration Demo */}
                  <Route path="/real-time-demo" element={
                    <>
                                        <Navigation />
                                        <Collaboration />
                    </>
                  } />

                  {/* Phase 2: User Access Management */}
                  <Route path="/user-access" element={
                    <>
                                        <Navigation />
                                        <UserAccessManagement />
                    </>
                  } />

                  {/* Phase 2: Advanced Analytics */}
                  <Route path="/advanced-analytics" element={
                    <>
                      <Navigation />
                      <AdvancedAnalytics />
                    </>
                  } />
                  
                  {/* Phase 2: Performance Analytics */}
                  <Route path="/performance-analytics" element={
                    <>
                      <Navigation />
                      <PerformanceAnalytics />
                    </>
                  } />

                                    {/* Phase 2: Monitoring Dashboard */}
                                    <Route path="/monitoring" element={
                                      <>
                                        <Navigation />
                                        <MonitoringDashboard />
                                      </>
                                    } />

                                    {/* Phase 2: API Version Management */}
                                    <Route path="/api-versioning" element={
                                      <>
                                        <Navigation />
                                        <VersionManagement />
                                      </>
                                    } />

                                    <Route path="/validation" element={
                                      <>
                                        <Navigation />
                                        <ValidationDashboard />
                                      </>
                                    } />

                                    {/* Phase 2: Offline Support */}
                                    <Route path="/offline" element={
                                      <>
                                        <Navigation />
                                        <OfflineDataManager />
                                      </>
                                    } />

                                    {/* Phase 2: PWA Settings */}
                                    <Route path="/pwa" element={
                                      <>
                                        <Navigation />
                                        <PWASettings />
                                      </>
                                    } />

                                    {/* Phase 2: Analytics Dashboard */}
                                    <Route path="/analytics" element={
                                      <>
                                        <Navigation />
                                        <AnalyticsDashboard />
                                      </>
                                    } />

                                    {/* Phase 2: Enterprise Dashboard */}
                                    <Route path="/enterprise" element={
                                      <>
                                        <Navigation />
                                        <EnterpriseDashboard />
                                      </>
                                    } />

                                    {/* Color Picker Tool */}
                                    <Route path="/color-picker" element={
                                      <>
                                        <Navigation />
                                        <ColorPicker />
                                      </>
                                    } />

                  <Route path="*" element={
                    <>
                      <Navigation />
                      <div className="p-8 text-center">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404 - Page Not Found</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                          Oops! The page you&apos;re looking for doesn&apos;t exist.
                        </p>
                        <Link to="/home" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                          Go to Home
                        </Link>
                      </div>
                    </>
                  } />
                </Routes>
                                </Suspense>

                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                  }}
                />

                                {/* Offline Indicator */}
                                <Suspense fallback={null}>
                                  <OfflineIndicator />
                                </Suspense>

                                {/* PWA Install Prompt */}
                                <Suspense fallback={null}>
                                  <PWAInstallPrompt />
                                </Suspense>

                                {/* PWA Update Notification */}
                                <Suspense fallback={null}>
                                  <PWAUpdateNotification />
                                </Suspense>
              </div>
            </Router>
                          </AnalyticsProvider>
                        </LanguageProvider>
                      </OfflineProvider>
                    </ValidationProvider>
                  </MonitoringProvider>
              </RealTimeProvider>
            </AuthProvider>
          </DevToolsProvider>
          </ThemeProvider>
        </SafariCompatibility>
      </SafariErrorBoundary>
    </ErrorBoundary>
  );
}

export default App; 