import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import KeyboardNavigation from './components/KeyboardNavigation';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import NotificationCenter from './components/NotificationCenter';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import InventoryManagement from './components/InventoryManagement';
import SpendingTracker from './components/SpendingTracker';
import Collaboration from './components/Collaboration';
import ShoppingLists from './components/ShoppingLists';
import RecipeManagement from './components/RecipeManagement';
import IntegrationsAutomation from './components/IntegrationsAutomation';
import DataAlerts from './components/DataAlerts';
import About from './components/About';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import UserProfile from './components/auth/UserProfile';
import LandingPage from './components/LandingPage';
import ThemeTest from './components/ThemeTest';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <KeyboardNavigation>
            <Router>
          <div className="App">
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
                  <Route path="/theme-test" element={<ThemeTest />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes */}
            <Route path="/home" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <Home />
                </>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <Dashboard />
                </>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <Settings />
                </>
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <NotificationCenter />
                </>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <AdvancedAnalytics />
                </>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <InventoryManagement />
                </>
              </ProtectedRoute>
            } />
            <Route path="/spending" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <SpendingTracker />
                </>
              </ProtectedRoute>
            } />
            <Route path="/collaboration" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <Collaboration />
                </>
              </ProtectedRoute>
            } />
            <Route path="/shopping-lists" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <ShoppingLists />
                </>
              </ProtectedRoute>
            } />
            <Route path="/recipes" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <RecipeManagement />
                </>
              </ProtectedRoute>
            } />
            <Route path="/integrations" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <IntegrationsAutomation />
                </>
              </ProtectedRoute>
            } />
            <Route path="/data-alerts" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <DataAlerts />
                </>
              </ProtectedRoute>
            } />
            <Route path="/about" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <About />
                </>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <UserProfile />
                </>
              </ProtectedRoute>
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
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
            </Router>
          </KeyboardNavigation>
        </AuthProvider>
      </ThemeProvider>
      </ErrorBoundary>
  );
}

export default App; 