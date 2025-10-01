import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestLogin = () => {
  const [email, setEmail] = useState('Cursor1@email.com');
  const [password, setPassword] = useState('Cursor123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login, currentUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      console.log('Login successful!', currentUser);
    } catch (err) {
      setError(err.message);
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser) {
    return (
      <div className="p-4 bg-green-100 border-2 border-green-500 rounded-lg m-4">
        <h3 className="text-lg font-bold text-green-800 mb-2">✅ Login Successful!</h3>
        <p className="text-green-700">Welcome, {currentUser.email}</p>
        <p className="text-sm text-green-600">You can now test the theme toggles with user context.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border-2 border-blue-500 rounded-lg m-4">
      <h3 className="text-lg font-bold text-blue-800 mb-2">Test Login</h3>
      <form onSubmit={handleLogin} className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-blue-700">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-700">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
      </form>
    </div>
  );
};

export default TestLogin;
