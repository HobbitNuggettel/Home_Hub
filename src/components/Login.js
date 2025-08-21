import React from 'react';
import { LoginForm } from './AuthSystem';

export default function Login() {
  const handleSwitchToRegister = () => {
    window.location.href = '/register';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-md mx-auto py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your Home Hub account</p>
        </div>
        
        <LoginForm onSwitchToRegister={handleSwitchToRegister} />
        
        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
