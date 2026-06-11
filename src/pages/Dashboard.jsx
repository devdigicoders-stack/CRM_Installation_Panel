import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { installationAPI, getStoredUser } from '../utils/api';
import { 
  FiLoader, 
  FiActivity, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiArrowRight,
  FiBriefcase,
  FiSettings,
  FiMoon
} from 'react-icons/fi';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [stats, setStats] = useState({
    totalAssigned: 0,
    inProgress: 0,
    completed: 0,
    issuesReported: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await installationAPI.getDashboard();
      if (response?.data) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const metricCards = [
    {
      title: 'Total Assigned',
      value: stats.totalAssigned,
      description: 'All installation works assigned to you',
      icon: FiBriefcase,
      iconColor: 'text-blue-500 bg-blue-50 border-blue-100',
      action: () => navigate('/installation/leads'),
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      description: 'Currently actively installing',
      icon: FiActivity,
      iconColor: 'text-yellow-600 bg-yellow-50 border-yellow-100',
      action: () => navigate('/installation/leads?status=in_progress'),
    },
    {
      title: 'Completed',
      value: stats.completed,
      description: 'Jobs successfully delivered and signed',
      icon: FiCheckCircle,
      iconColor: 'text-green-500 bg-green-50 border-green-100',
      action: () => navigate('/installation/leads?status=completed'),
    },
    {
      title: 'Delays / Issues',
      value: stats.issuesReported,
      description: 'Active blocks requiring attention',
      icon: FiAlertTriangle,
      iconColor: 'text-red-500 bg-red-50 border-red-100',
      action: () => navigate('/installation/leads?issueReported=true'),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-700">
      <Sidebar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 overflow-y-auto w-full md:pr-10">
        
        {/* Breadcrumb Top Header matching Leads.jsx */}
        <header className="flex justify-between items-center pb-4 border-b border-slate-200/80 mb-6">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Dashboard</span>
          <div className="flex items-center gap-4 text-slate-400">
            <FiSettings className="h-4.5 w-4.5 hover:text-slate-600 cursor-pointer transition" />
            <FiMoon className="h-4.5 w-4.5 hover:text-slate-600 cursor-pointer transition" />
          </div>
        </header>

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Hello, {user?.name || 'Installer'}!
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Here's the summary of your current installation pipeline and tasks.
            </p>
          </div>
          <button
            onClick={fetchDashboardStats}
            className="self-start px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition shadow-xs"
          >
            Refresh Data
          </button>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FiLoader className="h-8 w-8 text-[#4f46e5] animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading metrics overview...</p>
          </div>
        ) : error ? (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-650 text-sm max-w-lg mx-auto text-center space-y-3 shadow-xs">
            <FiAlertTriangle className="h-8 w-8 mx-auto" />
            <p>{error}</p>
            <button
              onClick={fetchDashboardStats}
              className="px-4 py-2 bg-red-200 rounded-xl text-red-750 text-xs font-semibold hover:bg-red-300 transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Metrics Cards in light mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={idx}
                    onClick={card.action}
                    className="bg-white border border-slate-200 p-6 rounded-3xl hover:scale-[1.01] hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between h-48 group shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-2xl border ${card.iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold text-[#4f46e5] group-hover:underline flex items-center gap-0.5">
                        View List <FiArrowRight className="h-2.5 w-2.5" />
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                        {card.title}
                      </h3>
                      <p className="text-4xl font-extrabold text-slate-900 mt-1 select-all">
                        {card.value}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1">
                        {card.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Shortcuts in light mode */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-800 mb-4">Quick Shortcuts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/installation/leads')}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/75 border border-slate-200 rounded-2xl text-left transition"
                >
                  <div>
                    <h3 className="font-semibold text-slate-700 text-sm">View Active Pipeline</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Assigned and in-progress leads</p>
                  </div>
                  <FiArrowRight className="text-slate-400 h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => navigate('/installation/leads?status=assigned')}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/75 border border-slate-200 rounded-2xl text-left transition"
                >
                  <div>
                    <h3 className="font-semibold text-slate-700 text-sm">New Work Orders</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Leads awaiting first contact</p>
                  </div>
                  <FiArrowRight className="text-slate-400 h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/75 border border-slate-200 rounded-2xl text-left transition"
                >
                  <div>
                    <h3 className="font-semibold text-slate-700 text-sm">Manage Credentials</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Update password and profile details</p>
                  </div>
                  <FiArrowRight className="text-slate-400 h-4.5 w-4.5" />
                </button>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
