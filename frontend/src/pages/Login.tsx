import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import authConfig from '../config/auth.json';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authConfig.users.find(u => u.username === username && u.password === password);
    
    if (user) {
      sessionStorage.setItem('isAuthenticated', 'true');
      const from = location.state?.from?.pathname || "/admin";
      navigate(from, { replace: true });
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      <div className="fixed inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
      
      <div className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-lg p-8 rounded-lg border border-slate-800/50 shadow-xl">
          <div className="flex justify-center mb-8">
            <div className="p-3 rounded-full bg-blue-500/10">
              <Lock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-8">Admin Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-400">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;