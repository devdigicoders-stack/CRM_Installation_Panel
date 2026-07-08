import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { installationAPI } from '../utils/api';
import { FiUpload, FiAlertTriangle, FiCheckCircle, FiLoader, FiFileText } from 'react-icons/fi';

const SERVER_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1').replace('/api/v1', '');
const getFileUrl = (url) => url?.startsWith('http') ? url : `${SERVER_BASE_URL}${url}`;

export default function UploadProof() {
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [file, setFile] = useState(null);

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
        if (selectedLeadId) {
          const fresh = response.data.leads.find((l) => l._id === selectedLeadId);
          setSelectedLead(fresh || null);
        }
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
    setFile(null);
    const selected = leads.find((l) => l._id === leadId);
    setSelectedLead(selected || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeadId) {
      setError('Please select a lead first.');
      return;
    }
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await installationAPI.uploadProof(selectedLeadId, file);
      setSuccess('Installation proof document uploaded successfully!');
      setFile(null);
      fetchLeadsList(); // Refresh to reflect new proof URL
    } catch (err) {
      setError(err.message || 'Failed to upload proof.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-700">
      <Sidebar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-6 overflow-y-auto w-full md:pr-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Upload Installation Proof</h1>

        <div className="grid grid-cols-1 gap-8 max-w-2xl">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FiUpload className="text-[#4f46e5] h-5 w-5" /> Upload Proof Document
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
                        {lead.name} ({lead.phone}) - Proof: {lead.installationProofUrl ? 'Uploaded ✓' : 'Pending'}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLeadId && (
                  <>
                    {/* Current proof URL check */}
                    {selectedLead?.installationProofUrl && (
                      <div className="p-4 rounded-2xl bg-[#e8effe]/30 border border-blue-100/60 text-xs flex justify-between items-center">
                        <span className="text-slate-500 font-medium">An installation proof is already uploaded.</span>
                        <a
                          href={getFileUrl(selectedLead.installationProofUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-lg transition"
                        >
                          <FiFileText className="h-3.5 w-3.5" /> View Proof
                        </a>
                      </div>
                    )}

                    {/* File Dropzone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Upload Proof File
                      </label>
                      <div className="border-2 border-dashed border-slate-350 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setFile(e.target.files[0])}
                          required
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <FiUpload className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                        <p className="text-xs font-bold text-slate-600">
                          {file ? file.name : 'Click or Drag file here to upload'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Supports PNG, JPG, JPEG, or PDF (max 10MB)
                        </p>
                      </div>
                    </div>

                    {file && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-[10px]">
                        <span className="text-slate-600 font-mono text-ellipsis overflow-hidden">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          Clear
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !file}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white font-bold rounded-2xl transition shadow-lg shadow-indigo-500/10"
                    >
                      {loading ? 'Uploading Proof...' : 'Upload Proof Document'}
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
