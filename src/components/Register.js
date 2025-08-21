import React from 'react';
import { RegisterForm } from './AuthSystem';

export default function Register() {
  const handleSwitchToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-md mx-auto py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join Home Hub to start managing your home</p>
        </div>
        
        <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
        
        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
