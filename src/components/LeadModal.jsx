import { useState } from 'react';
import WhatsAppChooserModal from './WhatsAppChooserModal';
import { installationAPI } from '../utils/api';

const SERVER_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1').replace('/api/v1', '');
const getFileUrl = (url) => url?.startsWith('http') ? url : `${SERVER_BASE_URL}${url}`;
import { 
  FiX, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiTrendingUp, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiClock, 
  FiFileText, 
  FiUpload, 
  FiMessageSquare,
  FiMessageCircle,
  FiCalendar
} from 'react-icons/fi';

export default function LeadModal({ lead, onClose, onRefresh }) {
  const [waModalLead, setWaModalLead] = useState(null);

  const [activeTab, setActiveTab] = useState('info'); // 'info', 'status', 'issue', 'proof'
  const [status, setStatus] = useState(lead.installationStatus || 'assigned');
  const [progressRemarks, setProgressRemarks] = useState(lead.installationProgressRemarks || '');
  const [issueRemarks, setIssueRemarks] = useState('');
  const [file, setFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle status update
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (status === 'completed' && (!lead.installationProofUrl || lead.installationProofUrl.trim() === '')) {
      setError('Please upload the proof of installation under the "Upload Proof" tab before marking it as completed.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await installationAPI.updateStatus(lead._id, status, progressRemarks);
      setSuccess('Status updated successfully!');
      onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Handle reporting issue
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueRemarks.trim()) {
      setError('Please enter issue remarks.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await installationAPI.reportIssue(lead._id, issueRemarks);
      setSuccess('Issue reported successfully!');
      setIssueRemarks('');
      onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  // Handle proof upload
  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await installationAPI.uploadProof(lead._id, file);
      setSuccess('Proof uploaded successfully!');
      setFile(null);
      onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to upload proof');
    } finally {
      setLoading(false);
    }
  };

  // Status badge style helper
  const getStatusBadge = (statusVal) => {
    switch(statusVal) {
      case 'completed':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 text-slate-700">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200/80 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{lead.name}</h2>
            <div className="flex gap-2 items-center mt-1">
              <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-bold ${getStatusBadge(lead.installationStatus)}`}>
                {lead.installationStatus}
              </span>
              {lead.installationIssueReported && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 font-bold animate-pulse">
                  <FiAlertTriangle className="h-3 w-3" /> Issue Reported
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 border border-slate-200/50 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          {[
            { id: 'info', label: 'Lead Info & Remarks', icon: FiFileText },
            { id: 'status', label: 'Update Status', icon: FiTrendingUp },
            { id: 'issue', label: 'Report Issue/Delay', icon: FiAlertTriangle },
            { id: 'proof', label: 'Upload Proof', icon: FiUpload },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold transition border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#4f46e5] text-[#4f46e5] bg-[#4f46e5]/5'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/30'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Notification Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm flex gap-2.5 items-center">
              <FiAlertTriangle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm flex gap-2.5 items-center">
              <FiCheckCircle className="h-5 w-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB CONTENT: INFO */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Core Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 border-b border-slate-200/80 pb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                    Contact & Address
                  </h3>
                  <div className="space-y-2 text-xs">
                    <p className="flex items-center gap-2 text-slate-600">
                      <FiPhone className="text-slate-400" />
                      <a href={`tel:${lead.phone}`} className="hover:underline font-semibold">{lead.phone}</a>
                    </p>
                    {lead.email && (
                      <p className="flex items-center gap-2 text-slate-600">
                        <FiMail className="text-slate-400" />
                        <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                      </p>
                    )}
                    <p className="flex items-start gap-2 text-slate-600">
                      <FiMapPin className="text-slate-400 mt-0.5 shrink-0" />
                      <span>{lead.productDetails || 'No product details / address provided'}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 border-b border-slate-200/80 pb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                    Order Details
                  </h3>
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-600">
                      Deal Value: <span className="font-bold text-slate-900">₹{lead.dealValue || 0}</span>
                    </p>
                    <p className="text-slate-600 flex items-center gap-1.5">
                      Payment Status: <span className="uppercase text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded text-[10px] font-bold">{lead.paymentStatus || 'pending'}</span>
                    </p>
                    <p className="text-slate-600 flex items-center gap-1.5">
                      <FiCalendar className="text-slate-400" /> Expected Delivery: <span className="text-slate-800 font-semibold">{lead.expectedDeliveryDate ? new Date(lead.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</span>
                    </p>
                    {(lead.trackingId || lead.awbNumber) && (
                      <div className="text-slate-600 flex flex-col gap-1 mt-1 border-t border-slate-200/60 pt-2">
                        {lead.awbNumber && <p>AWB Number: <span className="text-indigo-600 font-mono font-bold">{lead.awbNumber}</span></p>}
                        {lead.trackingId && <p>Tracking ID: <span className="text-slate-800 font-mono font-bold">{lead.trackingId}</span></p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Integrations (Quick Links) */}
              <div className="flex flex-wrap gap-3">
                {lead.integrations?.whatsappLink && (
                  <button
                    onClick={() => setWaModalLead(lead)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs transition"
                  >
                    <FiMessageCircle className="h-4 w-4" /> WhatsApp Message
                  </button>
                )}
                {lead.integrations?.callUri && (
                  <a
                    href={lead.integrations.callUri}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-xs transition"
                  >
                    <FiPhone className="h-4 w-4" /> Call Representative
                  </a>
                )}

                {lead.invoiceUrl && (
                  <a
                    href={getFileUrl(lead.invoiceUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs transition"
                  >
                    <FiFileText className="h-4 w-4" /> View Invoice
                  </a>
                )}
                
                {lead.installationProofUrl && (
                  <a
                    href={getFileUrl(lead.installationProofUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs transition ml-auto"
                  >
                    <FiFileText className="h-4 w-4" /> View Current Proof
                  </a>
                )}
              </div>

              {/* Issue Details */}
              {lead.installationIssueReported && lead.installationIssueRemarks && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-150 space-y-2">
                  <h4 className="text-xs font-bold text-red-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <FiAlertTriangle className="h-4 w-4" /> Current Delay / Issue Report
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{lead.installationIssueRemarks}"
                  </p>
                </div>
              )}

              {/* Remarks History Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 border-b border-slate-200/80 pb-1.5 uppercase tracking-wider">
                  Remarks & History
                </h3>
                {lead.remarks && lead.remarks.length > 0 ? (
                  <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-4">
                    {lead.remarks.slice().reverse().map((remark, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <div className="absolute -left-[23px] top-1 h-2 w-2 rounded-full bg-slate-300 border border-white" />
                        <div className="text-[10px] text-slate-400 flex gap-2 items-center">
                          <span className="font-bold text-slate-500">{remark.addedBy?.name || 'Staff'}</span>
                          <span>•</span>
                          <span>{new Date(remark.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 font-semibold">{remark.note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No notes or remarks available.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: UPDATE STATUS */}
          {activeTab === 'status' && (
            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Installation Status
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
                          : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Progress Remarks / Notes
                </label>
                <textarea
                  value={progressRemarks}
                  onChange={(e) => setProgressRemarks(e.target.value)}
                  placeholder="Enter details about installation progress..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-xs focus:outline-none focus:border-green-500 focus:bg-white resize-none transition"
                />
              </div>

              {status === 'completed' && !lead.installationProofUrl && (
                <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs flex gap-2 items-center">
                  <FiAlertTriangle className="h-5 w-5 shrink-0" />
                  <span>Important: If you choose "Completed", please upload the proof of installation under the "Upload Proof" tab.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white font-bold rounded-2xl transition shadow-lg shadow-indigo-500/10"
              >
                {loading ? 'Updating...' : 'Save Status Update'}
              </button>
            </form>
          )}

          {/* TAB CONTENT: REPORT ISSUE */}
          {activeTab === 'issue' && (
            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex gap-2">
                <FiAlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
                <div>
                  <p className="font-bold text-red-700">Reporting Issues or Delays</p>
                  <p className="opacity-80 mt-0.5">This will flag the lead on the admin dashboard, letting them know there is a bottleneck or delay.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Describe Issue / Reason for Delay
                </label>
                <textarea
                  value={issueRemarks}
                  onChange={(e) => setIssueRemarks(e.target.value)}
                  placeholder="Explain why the installation is delayed or what problem you encountered..."
                  rows={4}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-xs focus:outline-none focus:border-red-500 focus:bg-white resize-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-2xl transition shadow-lg shadow-red-500/10"
              >
                {loading ? 'Submitting Report...' : 'Report Issue / Delay'}
              </button>
            </form>
          )}

          {/* TAB CONTENT: UPLOAD PROOF */}
          {activeTab === 'proof' && (
            <form onSubmit={handleProofSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Installation Proof File
                </label>
                <div className="border-2 border-dashed border-slate-350 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FiUpload className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                  <p className="text-xs font-bold text-slate-600">
                    {file ? file.name : 'Click or Drag file to upload'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports PNG, JPG, JPEG, SVG, WEBP or PDF (max 10MB)
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
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white font-bold rounded-2xl transition"
              >
                {loading ? 'Uploading File...' : 'Upload Proof Document'}
              </button>
            </form>
          )}

        </div>
      </div>
      <WhatsAppChooserModal link={waModalLead?.integrations?.whatsappLink} phone={waModalLead?.phone} isOpen={!!waModalLead} onClose={() => setWaModalLead(null)} />
    </div>
  );
}
