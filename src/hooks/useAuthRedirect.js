import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';

export function useAuthRedirect() {
  // Temporarily handle disabled AuthContext
  let authResult;
  try {
    authResult = useAuth();
  } catch (error) {
    console.log('AuthContext temporarily disabled');
    authResult = { currentUser: null, loading: false };
  }

  const { currentUser, loading } = authResult || { currentUser: null, loading: false };
  const navigate = useNavigate();

  useEffect(() => {
    // RE-ENABLED: Let users see the landing page with navigation
    if (!loading && currentUser) {
      // If user is authenticated and on landing page, redirect to home
      if (window.location.pathname === '/') {
        navigate('/home');
      }
    }
  }, [currentUser, loading, navigate]);

  return { currentUser, loading };
}
