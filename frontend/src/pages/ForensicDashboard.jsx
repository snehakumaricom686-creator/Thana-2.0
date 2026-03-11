import { useState, useEffect } from 'react';
import axios from 'axios';
import { Microscope, FileText, ShieldCheck, Upload, CheckCircle, Clock, Lock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ForensicDashboard.css';
import CaseProgressTracker from '../components/CaseProgressTracker';

const ForensicDashboard = () => {
  const [evidence, setEvidence] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [reportText, setReportText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const user = JSON.parse(localStorage.getItem('thana2_user') || '{}');

  useEffect(() => {
    fetchEvidence();
  }, []);

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/evidence');
      setEvidence(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!selectedEvidence || !reportText.trim()) return;
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/reports', {
        evidenceId: selectedEvidence._id,
        caseId: selectedEvidence.caseId,
        reportText,
        forensicOfficerId: user.officerId,
        forensicOfficerName: user.name,
      });
      setSuccessMsg('✅ Forensic Report submitted successfully!');
      setReportText('');
      setSelectedEvidence(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Error submitting report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="forensic-dashboard">
      {/* Header */}
      <div className="forensic-hero glass-card">
        <div className="forensic-hero-badge">
          <Microscope size={36} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Forensic Laboratory Portal</h1>
          <p className="text-secondary text-sm">Welcome, <strong>{user.name}</strong> — Forensic Officer Access</p>
          <div className="role-tag forensic-tag">🟢 Forensic Division</div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="forensic-stats">
        <div className="stat-item glass-card">
          <Upload size={22} className="text-blue-400" />
          <div>
            <div className="stat-num">{evidence.length}</div>
            <div className="stat-label">Evidence Files Available</div>
          </div>
        </div>
        <div className="stat-item glass-card">
          <FileText size={22} className="text-yellow-400" />
          <div>
            <div className="stat-num">{reports.length}</div>
            <div className="stat-label">Reports Submitted</div>
          </div>
        </div>
        <div className="stat-item glass-card">
          <ShieldCheck size={22} className="text-green-400" />
          <div>
            <div className="stat-num">{evidence.filter(e => e.fileHash).length}</div>
            <div className="stat-label">Hash-Verified Files</div>
          </div>
        </div>
        <div className="stat-item glass-card">
          <Clock size={22} className="text-orange-400" />
          <div>
            <div className="stat-num">{evidence.filter(e => !e.forensicReportId).length}</div>
            <div className="stat-label">Pending Analysis</div>
          </div>
        </div>
      </div>

      <div className="forensic-grid">
        {/* Left: Evidence List */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Upload size={18} className="text-primary" /> Uploaded Evidence Files
          </h2>
          {loading && <p className="text-secondary text-sm">Loading evidence...</p>}
          {!loading && evidence.length === 0 && (
            <div className="text-center py-8 text-secondary">
              <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
              <p>No evidence uploaded yet.</p>
              <p className="text-xs mt-1">Inspectors must upload evidence first.</p>
            </div>
          )}
          <div className="evidence-list-forensic">
            {evidence.map(ev => (
              <div
                key={ev._id}
                className={`evidence-list-item ${selectedEvidence?._id === ev._id ? 'selected' : ''}`}
                onClick={() => setSelectedEvidence(ev)}
              >
                <div className="ev-thumb">
                  <img src={ev.cloudinaryUrl} alt="Ev" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{ev.description || 'Evidence File'}</div>
                  <div className="text-xs text-secondary mt-0.5">
                    Case: {ev.caseId?.firNumber || ev.caseId || 'N/A'} &bull; {ev.evidenceType}
                  </div>
                  <div className="text-[10px] font-mono text-green-400 mt-0.5 flex items-center gap-1">
                    <Lock size={9} /> {ev.fileHash?.substring(0, 16) || 'Hash Pending'}...
                  </div>
                </div>
                {selectedEvidence?._id === ev._id && (
                  <CheckCircle size={16} className="text-primary shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Report Panel */}
        <div className="glass-card p-6 flex flex-col">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FileText size={18} className="text-primary" /> Forensic Analysis Report
          </h2>

          {successMsg && (
            <div className="success-banner">{successMsg}</div>
          )}

          {!selectedEvidence ? (
            <div className="flex-1 flex flex-col items-center justify-center text-secondary py-8">
              <Microscope size={48} className="opacity-30 mb-3" />
              <p className="text-center text-sm">Select an evidence file from the left panel to begin your forensic analysis.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="flex flex-col flex-1 gap-4">
              {/* Show case progress tracker for the selected evidence's case */}
              {selectedEvidence?.caseId && (
                <div style={{ marginBottom: '1rem' }}>
                  <CaseProgressTracker
                    caseData={{
                      firNumber: selectedEvidence.caseId?.firNumber || selectedEvidence.caseId,
                      title: selectedEvidence.description || 'Evidence Case',
                      status: 'Forensic Analysis',
                      _id: selectedEvidence.caseId?._id || selectedEvidence.caseId,
                    }}
                    evidenceCount={1}
                    hasForensicReport={false}
                    compact={true}
                  />
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1rem 0' }} />
                </div>
              )}
              <div className="selected-ev-banner">
                <ShieldCheck size={16} className="text-green-400" />
                <div>
                  <div className="font-semibold text-sm">{selectedEvidence.description}</div>
                  <div className="text-xs text-secondary">Type: {selectedEvidence.evidenceType} &bull; Uploaded: {new Date(selectedEvidence.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="input-group flex-1">
                <label>Forensic Analysis Summary</label>
                <textarea
                  className="input-field"
                  rows="10"
                  style={{ flex: 1, resize: 'none', minHeight: '200px' }}
                  placeholder={`Write your forensic analysis here...\n\nInclude:\n- Physical characteristics\n- Chain of custody observations\n- Scientific findings\n- Conclusions & recommendations`}
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button type="button" className="btn btn-outline" onClick={() => setSelectedEvidence(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                  <FileText size={16} />
                  {submitting ? 'Submitting...' : 'Submit Forensic Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForensicDashboard;
