import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, getAuthToken } from '../utils/api';
import { FiMail, FiLock, FiAlertTriangle, FiHardDrive, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (getAuthToken()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.login(email, password);
      try {
        const { initNotifications, listenForMessages } = await import('../utils/firebase');
        initNotifications();
        listenForMessages();
      } catch (fcmErr) {
        console.error('FCM init failed after login:', fcmErr);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#f8fafc] px-4 py-12 overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-100/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-100/30 blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="bg-white w-full max-w-md p-8 rounded-3xl border border-slate-200 shadow-xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-200">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 rounded-2xl bg-[#e8effe] border border-blue-100 text-[#4f46e5] mb-3">
            <FiHardDrive className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-400 mt-1">CRM Installation Operations Portal</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex gap-2.5 items-center">
            <FiAlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <FiMail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="installer@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-slate-700 placeholder-slate-400 text-xs focus:outline-none focus:border-green-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <FiLock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-11 py-3.5 text-slate-700 placeholder-slate-400 text-xs focus:outline-none focus:border-green-500 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-4 bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/15 hover:scale-[1.01] active:scale-[0.99] transition duration-150"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer note */}
        <div className="text-center mt-6 text-[10px] text-slate-400 font-medium">
          This system is restricted to authorized personnel only.
        </div>
      </div>
    </div>
  );
}
