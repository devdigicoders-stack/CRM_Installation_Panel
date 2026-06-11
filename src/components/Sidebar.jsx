import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authAPI, getStoredUser, notificationAPI } from '../utils/api';
import { 
  FiLayout, 
  FiFileText, 
  FiLock,
  FiAlertTriangle,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiTrendingUp,
  FiClock,
  FiUpload,
  FiBell
} from 'react-icons/fi';

export default function Sidebar() {
  const location = useLocation();
  const user = getStoredUser();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      if (res?.data?.notifications) setNotifications(res.data.notifications);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => notificationAPI.markAsRead(n._id).catch(() => {})));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const isActive = (path) => {
    // Exact match or matches URL search queries
    if (path.includes('?')) {
      const [basePath, search] = path.split('?');
      return location.pathname === basePath && location.search.includes(search);
    }
    return location.pathname === path && !location.search;
  };

  // Nav items based on required slides and profile
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiLayout },
    { name: 'Leads', path: '/installation/leads', icon: FiFileText },
    { name: 'Update Status', path: '/update-status', icon: FiTrendingUp },
    { name: 'Update Progress', path: '/update-progress', icon: FiClock },
    { name: 'Upload Proof', path: '/upload-proof', icon: FiUpload },
    { name: 'Report Issue', path: '/report-issue', icon: FiAlertTriangle },
    { name: 'Profile', path: '/profile', icon: FiUser },
    { name: 'Change Password', path: '/change-password', icon: FiLock },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 px-5 py-6 justify-between select-none">
      
      {/* Header Logo */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">
            Installation Panel
          </span>

          {/* Notification Bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => { setBellOpen((v) => !v); if (!bellOpen) fetchNotifications(); }}
              className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
            >
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute left-0 top-10 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-[10px] font-semibold text-[#4f46e5] hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => !n.read && handleMarkRead(n._id)}
                        className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition ${!n.read ? 'bg-indigo-50/60' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs leading-snug ${!n.read ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>
                            {n.title}
                          </p>
                          {!n.read && <span className="mt-0.5 h-2 w-2 rounded-full bg-[#4f46e5] shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-slate-300 mt-1">
                          {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links matching screenshot style */}
        <nav className="space-y-0.5 pt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-[#e8effe] text-[#4f46e5] font-bold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-55/40'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${active ? 'text-[#4f46e5]' : 'text-slate-450'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info Badge & Sign Out Button matching screenshot */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        {user && (
          <Link
            to="/profile"
            className="bg-[#f8fafc] hover:bg-slate-100/80 border border-slate-100/60 rounded-2xl p-4 flex items-center gap-3 transition cursor-pointer text-left block"
          >
            <div className="h-10 w-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-slate-800 truncate">{user.name}</h4>
              <p className="text-[11px] text-slate-400 capitalize">{user.role} Rep</p>
            </div>
          </Link>
        )}
        
        <button
          onClick={() => authAPI.logout()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 hover:border-red-300 text-red-650 hover:bg-red-50 text-sm font-bold transition-all duration-200"
        >
          <FiLogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Floating Hamburger Toggle for Mobile */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-650 shadow-md focus:outline-none"
        >
          {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Slide-over */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer container */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white h-full animate-in slide-in-from-left duration-150">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
