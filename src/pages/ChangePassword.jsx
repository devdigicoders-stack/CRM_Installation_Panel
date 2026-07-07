import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { authAPI } from '../utils/api';
import { FiLock, FiAlertTriangle, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassLoading(true);
    setPassError('');
    setPassSuccess('');

    try {
      await authAPI.changePassword(currentPassword, newPassword, confirmPassword);
      setPassSuccess('Password updated successfully!');
      setCurrentPassword('');
      newPassword && setNewPassword('');
      confirmPassword && setConfirmPassword('');
    } catch (err) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-700">
      <Sidebar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-6 overflow-y-auto w-full md:pr-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Security settings</h1>

        <div className="grid grid-cols-1 gap-8 max-w-2xl">
          {/* PASSWORD UPDATE FORM */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FiLock className="text-[#4f46e5] h-5 w-5" /> Change Password
            </h2>

            {passError && (
              <div className="p-4 mb-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex gap-2.5 items-center">
                <FiAlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{passError}</span>
              </div>
            )}
            {passSuccess && (
              <div className="p-4 mb-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-xs flex gap-2.5 items-center">
                <FiCheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-green-500 focus:bg-white transition"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showCurrent ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-green-500 focus:bg-white transition"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showNew ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-green-500 focus:bg-white transition"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-500/10"
                >
                  {passLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
