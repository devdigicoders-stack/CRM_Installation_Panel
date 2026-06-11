import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { installationAPI } from '../utils/api';
import { FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiLoader } from 'react-icons/fi';

export default function UpdateProgress() {
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [progressRemarks, setProgressRemarks] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLeadsList = async () => {
    setFetchLoading(true);
    try {
      const response = await installationAPI.getLeads({ limit: 100 });
      if (response?.data?.leads) {
        setLeads(response.data.leads);
      }
    } catch (err) {
      setError('Failed to fetch assigned leads list.');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsList();
  }, []);

  const handleLeadChange = (leadId) => {
    setSelectedLeadId(leadId);
    setSuccess('');
    setError('');
    const selected = leads.find((l) => l._id === leadId);
    if (selected) {
      setProgressRemarks(selected.installationProgressRemarks || '');
      setCurrentStatus(selected.installationStatus || 'assigned');
    } else {
      setProgressRemarks('');
      setCurrentStatus('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeadId) {
      setError('Please select a lead first.');
      return;
    }
    if (!progressRemarks.trim()) {
      setError('Please write some remarks/notes.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await installationAPI.updateStatus(selectedLeadId, currentStatus, progressRemarks);
      setSuccess('Installation progress remarks updated successfully!');
      fetchLeadsList(); // Refresh
    } catch (err) {
      setError(err.message || 'Failed to update progress remarks.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-700">
      <Sidebar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-6 overflow-y-auto w-full md:pr-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Update Progress</h1>

        <div className="grid grid-cols-1 gap-8 max-w-2xl">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FiTrendingUp className="text-[#4f46e5] h-5 w-5" /> Add Progress Remarks
            </h2>

            {error && (
              <div className="p-4 mb-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex gap-2.5 items-center">
                <FiAlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-4 mb-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-xs flex gap-2.5 items-center">
                <FiCheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {fetchLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <FiLoader className="h-6 w-6 text-[#4f46e5] animate-spin" />
                <p className="text-xs text-slate-400">Loading your assigned leads...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Select Lead */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Select Lead / Work Order
                  </label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => handleLeadChange(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 focus:outline-none focus:border-green-500 focus:bg-white transition"
                  >
                    <option value="">-- Choose a lead --</option>
                    {leads.map((lead) => (
                      <option key={lead._id} value={lead._id}>
                        {lead.name} ({lead.phone}) - Current Status: {lead.installationStatus}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLeadId && (
                  <>
                    {/* Current status display */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-400 font-bold uppercase">Current Status:</span>
                      <span className="font-bold text-[#4f46e5] capitalize">{currentStatus}</span>
                    </div>

                    {/* Progress remarks input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Add Progress Update Remarks
                      </label>
                      <textarea
                        value={progressRemarks}
                        onChange={(e) => setProgressRemarks(e.target.value)}
                        placeholder="Write down the new updates regarding the installation progress..."
                        rows={5}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-xs focus:outline-none focus:border-green-500 focus:bg-white resize-none transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white font-bold rounded-2xl transition shadow-lg shadow-indigo-500/10"
                    >
                      {loading ? 'Submitting Remarks...' : 'Submit Progress Update'}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
