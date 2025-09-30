// React import not needed in React 17+
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { DevToolsProvider } from './contexts/DevToolsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { RealTimeProvider } from './contexts/RealTimeContext';
import LandingPage from './components/LandingPage';
import Settings from './components/Settings';
import Home from './components/Home';
import Navigation from './components/Navigation';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import Inventory from './components/modules/Inventory';
import Spending from './components/modules/Spending';
import Collaboration from './components/modules/Collaboration';
import ShoppingLists from './components/modules/ShoppingLists';
import Recipes from './components/modules/Recipes';
import Integrations from './components/modules/Integrations';
import DataAlerts from './components/modules/DataAlerts';
import About from './components/modules/About';
import ImageManagement from './components/modules/ImageManagement';
import AISuggestions from './components/modules/AISuggestions';
import Maintenance from './components/modules/Maintenance';
import Profile from './components/Profile';
import RealTimeCollaboration from './components/RealTimeCollaboration';
import UserAccessManagement from './components/UserAccessManagement';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import LogoutTest from './components/LogoutTest';

function App() {
  return (
    <ThemeProvider>
      <DevToolsProvider>
        <AuthProvider>
          <RealTimeProvider>
            <Router>
              <div className="App">
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
                  <Route path="/settings" element={<Settings />} />
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
                      <Inventory />
                    </>
                  } />
                  <Route path="/spending" element={
                    <>
                      <Navigation />
                      <Spending />
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
                      <div className="min-h-screen bg-gray-50 p-6">
                        <div className="max-w-7xl mx-auto">
                          <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                              🚀 Phase 2: Real-time Collaboration Demo
                            </h1>
                            <p className="text-lg text-gray-600">
                              Experience the new real-time collaboration features in action!
                            </p>
                          </div>
                          <RealTimeCollaboration />
                        </div>
                      </div>
                    </>
                  } />

                  {/* Phase 2: User Access Management */}
                  <Route path="/user-access" element={
                    <>
                      <Navigation />
                      <div className="min-h-screen bg-gray-50 p-6">
                        <div className="max-w-7xl mx-auto">
                          <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                              🔐 User Access Management
                            </h1>
                            <p className="text-lg text-gray-600">
                              Grant and manage access for other users with secure permissions
                            </p>
                          </div>
                          <UserAccessManagement />
                        </div>
                      </div>
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
              </div>
            </Router>
          </RealTimeProvider>
        </AuthProvider>
      </DevToolsProvider>
    </ThemeProvider>
  );
}

export default App; 