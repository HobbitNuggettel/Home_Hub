import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { DevToolsProvider } from './contexts/DevToolsContext';
import { ThemeProvider } from './contexts/ThemeContext';
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

function App() {
  return (
    <ThemeProvider>
      <DevToolsProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

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
                <Route path="*" element={
                  <>
                    <Navigation />
                    <div className="p-8 text-center">
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404 - Page Not Found</h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                        Oops! The page you're looking for doesn't exist.
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
        </AuthProvider>
      </DevToolsProvider>
    </ThemeProvider>
  );
}

export default App; 