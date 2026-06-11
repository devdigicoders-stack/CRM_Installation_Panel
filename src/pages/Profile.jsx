import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { authAPI, getStoredUser } from '../utils/api';
import { FiUser, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

export default function Profile() {
  const storedUser = getStoredUser();
  const [profile, setProfile] = useState({
    name: storedUser?.name || '',
    email: storedUser?.email || '',
    phone: storedUser?.phone || '',
    role: storedUser?.role || '',
  });

  // Profile update form states
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  
  const [loading, setLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response?.data?.user) {
        const user = response.data.user;
        setProfile(user);
        setName(user.name);
        setPhone(user.phone || '');
      }
    } catch (err) {
      console.error('Failed to sync profile: ', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await authAPI.updateProfile({ name, phone });
      setProfileSuccess('Profile details updated successfully!');
      if (res.data?.user) {
        setProfile(res.data.user);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-700">
      <Sidebar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-6 overflow-y-auto w-full md:pr-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Account Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Brief Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-xs">
              <div className="h-20 w-20 rounded-full bg-[#e8effe] border border-blue-100 text-[#4f46e5] mx-auto flex items-center justify-center mb-4 text-3xl font-extrabold uppercase">
                {profile.name ? profile.name.slice(0, 2) : 'US'}
              </div>
              <h2 className="font-bold text-lg text-slate-800">{profile.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#e0e7ff] text-[#4f46e5] border border-blue-150 capitalize">
                  {profile.role || 'User'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="md:col-span-2 space-y-8">
            
            {/* PROFILE UPDATE FORM */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FiUser className="text-[#4f46e5] h-5 w-5" /> General Information
              </h2>

              {profileError && (
                <div className="p-4 mb-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex gap-2.5 items-center">
                  <FiAlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}
              {profileSuccess && (
                <div className="p-4 mb-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-xs flex gap-2.5 items-center">
                  <FiCheckCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-green-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-green-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-500/10"
                  >
                    {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
