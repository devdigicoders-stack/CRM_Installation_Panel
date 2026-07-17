import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LeadModal from '../components/LeadModal';
import Pagination from '../components/Pagination';
import { installationAPI } from '../utils/api';
import { 
  FiSearch, 
  FiLoader, 
  FiAlertTriangle, 
  FiRefreshCw,
  FiSettings,
  FiMoon,
  FiActivity,
  FiCheckCircle,
  FiBriefcase
} from 'react-icons/fi';

export default function Leads() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse parameters from URL query string
  const urlStatus = searchParams.get('status') || '';
  const urlIssue = searchParams.get('issueReported') || '';
  const urlPage = Number(searchParams.get('page')) || 1;
  const urlLimit = Number(searchParams.get('limit')) || 10;
  const focusSearchParam = searchParams.get('focusSearch') === 'true';

  // Local component states
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(urlStatus);
  const [issueReported, setIssueReported] = useState(urlIssue);
  
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [limit, setLimit] = useState(urlLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [dashboardStats, setDashboardStats] = useState({
    totalAssigned: 0,
    inProgress: 0,
    completed: 0,
    issuesReported: 0
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);

  // Sync state with URL params
  useEffect(() => {
    setStatus(urlStatus);
    setIssueReported(urlIssue);
    setCurrentPage(urlPage);
    setLimit(urlLimit);
  }, [urlStatus, urlIssue, urlPage, urlLimit]);

  // Focus search input if route has focus parameter
  useEffect(() => {
    if (focusSearchParam) {
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.focus();
    }
  }, [focusSearchParam]);

  // Fetch dashboard stats (total assigned, in progress, etc.)
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await installationAPI.getDashboard();
      if (response?.data) {
        setDashboardStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch leads callback
  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await installationAPI.getLeads({
        search,
        status,
        issueReported,
        page: currentPage,
        limit,
      });
      if (response?.data?.leads) {
        setLeads(response.data.leads);
        setTotalPages(response.pages || 1);
        setTotalResults(response.total || 0);
        
        // Update details modal references if currently open
        if (selectedLead) {
          const freshLead = response.data.leads.find((l) => l._id === selectedLead._id);
          if (freshLead) {
            setSelectedLead(freshLead);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch leads list.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial queries
  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [status, issueReported, currentPage, limit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateQueryParams({ page: 1 });
    fetchLeads();
  };

  // Quick helper to adjust URL query parameters
  const updateQueryParams = (newParams) => {
    const params = {
      status,
      issueReported,
      page: currentPage.toString(),
      limit: limit.toString(),
      ...newParams,
    };

    // Remove empty parameters
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });

    setSearchParams(params);
  };

  const handleStatusFilterChange = (newVal) => {
    setStatus(newVal);
    setCurrentPage(1);
    updateQueryParams({ status: newVal, page: 1 });
  };

  const handleIssueFilterChange = (newVal) => {
    setIssueReported(newVal);
    setCurrentPage(1);
    updateQueryParams({ issueReported: newVal, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateQueryParams({ page: newPage });
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
    updateQueryParams({ limit: newLimit, page: 1 });
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setIssueReported('');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Pill style helpers matching screenshot
  const getStatusPill = (val) => {
    switch (val) {
      case 'completed':
        return 'bg-green-100 text-green-700 font-semibold text-[10px] px-2 py-0.5 rounded';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 font-semibold text-[10px] px-2 py-0.5 rounded';
      default:
        return 'bg-indigo-100 text-indigo-700 font-semibold text-[10px] px-2 py-0.5 rounded';
    }
  };

  const getPriorityPill = (val) => {
    switch (val) {
      case 'high':
        return 'bg-red-100 text-red-700 font-semibold text-[10px] px-2 py-0.5 rounded';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 font-semibold text-[10px] px-2 py-0.5 rounded';
      default:
        return 'bg-slate-100 text-slate-600 font-semibold text-[10px] px-2 py-0.5 rounded';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-700">
      <Sidebar />

      <main className="flex-1 px-6 py-6 overflow-y-auto w-full max-w-7xl mx-auto md:pr-8">
        
        {/* Breadcrumb Top Header matching screenshot */}
        <header className="flex justify-between items-center pb-4 border-b border-slate-200/80 mb-6">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Leads</span>
          <div className="flex items-center gap-4 text-slate-400">
            <FiSettings className="h-4.5 w-4.5 hover:text-slate-600 cursor-pointer transition" />
            <FiMoon className="h-4.5 w-4.5 hover:text-slate-600 cursor-pointer transition" />
          </div>
        </header>

        {/* Title Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leads Center</h1>
            <p className="text-sm text-slate-500 mt-1">Manage, engage, and convert your leads efficiently.</p>
          </div>
          <button
            onClick={() => {
              fetchLeads();
              fetchStats();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition shadow-xs"
          >
            <FiRefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Stats Grid matching layout in screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card: Total Leads */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {statsLoading ? '...' : dashboardStats.totalAssigned}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-500 border border-blue-100">
              <FiBriefcase className="h-5 w-5" />
            </div>
          </div>

          {/* Card: Active/In Progress */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {statsLoading ? '...' : dashboardStats.inProgress}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-yellow-50 text-yellow-600 border border-yellow-100">
              <FiActivity className="h-5 w-5" />
            </div>
          </div>

          {/* Card: High Priority / Issues */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delays / Issues</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {statsLoading ? '...' : dashboardStats.issuesReported}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-red-50 text-red-500 border border-red-100">
              <FiAlertTriangle className="h-5 w-5" />
            </div>
          </div>

        </div>

        {/* Filter Controls Row */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 shadow-xs">
          
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <FiSearch className="h-4 w-4" />
            </span>
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone or email..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:bg-white transition"
            />
          </form>

          {/* Status Dropdown */}
          <div>
            <select
              value={status}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-green-500 focus:bg-white transition"
            >
              <option value="">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Issues Dropdown */}
          <div>
            <select
              value={issueReported}
              onChange={(e) => handleIssueFilterChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-green-500 focus:bg-white transition"
            >
              <option value="">All Issues</option>
              <option value="true">Issues Reported</option>
              <option value="false">No Issues</option>
            </select>
          </div>

          {(status || issueReported || search) && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition"
            >
              Clear
            </button>
          )}

        </div>

        {/* Clean Data Table Container matching user screenshot */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FiLoader className="h-8 w-8 text-[#4f46e5] animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Fetching table records...</p>
          </div>
        ) : error ? (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm max-w-lg mx-auto text-center space-y-3 shadow-xs">
            <FiAlertTriangle className="h-8 w-8 mx-auto" />
            <p>{error}</p>
            <button
              onClick={fetchLeads}
              className="px-4 py-2 bg-red-200 rounded-xl text-red-700 text-xs font-semibold hover:bg-red-300 transition"
            >
              Reload
            </button>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <p className="text-slate-400 text-sm">No installation records match the filter query.</p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {/* Scrollable table container */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-[#f8fafc] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Priority</th>
                    <th className="px-6 py-4 text-center">Verification</th>
                    <th className="px-6 py-4 text-center">Payment</th>
                    <th className="px-6 py-4 text-right">Deal Value</th>
                    <th className="px-6 py-4 whitespace-nowrap">AWB / Tracking</th>
                    <th className="px-6 py-4">Latest Remarks</th>
                    <th className="px-6 py-4 text-center">Delivery</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-xs font-medium text-slate-700">
                  {leads.map((lead) => (
                    <tr 
                      key={lead._id} 
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">{lead.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-semibold">{lead.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">{lead.email || '-'}</td>
                      
                      {/* Status */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={getStatusPill(lead.installationStatus)}>
                          {lead.installationStatus}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={getPriorityPill(lead.priority)}>
                          {lead.priority}
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          lead.verificationStatus === 'verified' 
                            ? 'bg-green-100 text-green-700' 
                            : lead.verificationStatus === 'rejected'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {lead.verificationStatus || 'pending'}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          lead.paymentStatus === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : lead.paymentStatus === 'partial'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {lead.paymentStatus || 'pending'}
                        </span>
                      </td>

                      {/* Deal Value */}
                      <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-slate-900">
                        ₹{lead.dealValue || 0}
                      </td>

                      {/* AWB / Tracking */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.awbNumber ? (
                          <div className="font-bold text-indigo-600 mb-0.5" title="AWB Number">AWB: {lead.awbNumber}</div>
                        ) : null}
                        {lead.trackingId ? (
                          <div className="font-semibold text-slate-700 text-[10px]" title="Tracking ID">Track: {lead.trackingId}</div>
                        ) : null}
                        {!lead.awbNumber && !lead.trackingId && <span className="text-slate-400">-</span>}
                      </td>

                      {/* Latest Remarks */}
                      <td className="px-6 py-4 max-w-xs truncate text-slate-500 text-xs italic">
                        {lead.installationProgressRemarks || lead.remarks?.[lead.remarks.length - 1]?.note || '-'}
                      </td>

                      {/* Delivery Status */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold capitalize ${
                          lead.deliveryStatus === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : lead.deliveryStatus === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {lead.deliveryStatus || 'pending'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="px-3 py-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold rounded-lg transition"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Custom Pagination Panel */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        )}

        {/* Details and Actions Management Modal */}
        {selectedLead && (
          <LeadModal
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onRefresh={fetchLeads}
          />
        )}

      </main>
    </div>
  );
}
