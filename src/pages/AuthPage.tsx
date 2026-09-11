import React, { useState } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { Cloud, Lock, Mail, User, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup } = useUserProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Here you could also send a login notification email if desired
        // For now we just login
        login();
      } else {
        if (name && email && password) {
          // Implement EmailJS for Signup
          // Replace these strings with your actual EmailJS IDs
          const serviceID = 'YOUR_SERVICE_ID';
          const templateID = 'YOUR_TEMPLATE_ID';
          const publicKey = 'YOUR_PUBLIC_KEY';

          try {
            // Note: If you don't have these set up yet, this will fail.
            // Comment this out or replace with actual keys to make it work.
            if (serviceID !== 'YOUR_SERVICE_ID') {
              await emailjs.send(
                serviceID,
                templateID,
                {
                  to_name: name,
                  to_email: email,
                  message: 'Welcome to WeatherGPT! Your account has been created successfully.',
                },
                publicKey
              );
            } else {
              console.log('EmailJS not configured with actual keys. Skipping email send.');
            }
          } catch (error) {
            console.error('Error sending email via EmailJS:', error);
          }

          signup();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-slate-900 text-slate-100 flex items-center justify-center p-4 rounded-2xl">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700/50">
        <div className="p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="bg-sky-500/20 p-3 rounded-full mb-4">
              <Cloud className="w-8 h-8 text-sky-400" />
            </div>
            <h1 className="text-2xl font-bold text-center">WeatherGPT</h1>
            <p className="text-slate-400 text-sm mt-1 text-center">
              {isLogin ? 'Sign in to access your dashboard' : 'Create an account to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Signing In...' : 'Signing Up...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-sky-400 hover:text-sky-300 transition-colors focus:outline-none"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
