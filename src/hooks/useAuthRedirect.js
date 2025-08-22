import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function useAuthRedirect() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && currentUser) {
      // If user is authenticated and on landing page, redirect to home
      if (window.location.pathname === '/') {
        navigate('/home');
      }
    }
  }, [currentUser, loading, navigate]);

  return { currentUser, loading };
}
