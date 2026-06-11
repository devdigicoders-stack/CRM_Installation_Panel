import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { installationAPI } from '../utils/api';
import { FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiLoader } from 'react-icons/fi';

export default function UpdateStatus() {
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [status, setStatus] = useState('assigned');
  const [progressRemarks, setProgressRemarks] = useState('');

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
      setStatus(selected.installationStatus || 'assigned');
      setProgressRemarks(selected.installationProgressRemarks || '');
    } else {
      setStatus('assigned');
      setProgressRemarks('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeadId) {
      setError('Please select a lead first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await installationAPI.updateStatus(selectedLeadId, status, progressRemarks);
      setSuccess('Installation status updated successfully!');
      fetchLeadsList(); // Refresh list to get updated details
    } catch (err) {
      setError(err.message || 'Failed to update installation status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-700">
      <Sidebar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-6 overflow-y-auto w-full md:pr-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Update Status</h1>

        <div className="grid grid-cols-1 gap-8 max-w-2xl">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FiTrendingUp className="text-[#4f46e5] h-5 w-5" /> Manage Installation Status
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
                        {lead.name} ({lead.phone}) - Current: {lead.installationStatus}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLeadId && (
                  <>
                    {/* Status selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Set Installation Status
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'assigned', label: 'Assigned', color: 'border-indigo-200 text-indigo-700 bg-indigo-50/50' },
                          { id: 'in_progress', label: 'In Progress', color: 'border-yellow-200 text-yellow-700 bg-yellow-50/50' },
                          { id: 'completed', label: 'Completed', color: 'border-green-200 text-green-700 bg-green-50/50' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setStatus(s.id)}
                            className={`py-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 ${
                              status === s.id
                                ? `${s.color} ring-2 ring-[#4f46e5] ring-offset-2`
                                : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-55/40'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Progress remarks */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Progress Remarks / Notes
                      </label>
                      <textarea
                        value={progressRemarks}
                        onChange={(e) => setProgressRemarks(e.target.value)}
                        placeholder="Describe current installation status or update notes..."
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-xs focus:outline-none focus:border-green-500 focus:bg-white resize-none transition"
                      />
                    </div>

                    {status === 'completed' && (
                      <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs flex gap-2 items-center">
                        <FiAlertTriangle className="h-5 w-5 shrink-0" />
                        <span>After marking as Completed, please upload the proof of installation on the Upload Proof page.</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white font-bold rounded-2xl transition shadow-lg shadow-indigo-500/10"
                    >
                      {loading ? 'Updating Status...' : 'Save Installation Status'}
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
