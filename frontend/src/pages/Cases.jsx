import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Filter,
  Clock,
  User,
  Shield,
  FileText,
  ChevronRight,
  Database,
  Plus
} from 'lucide-react';
import './Cases.css';
import CaseProgressTracker from '../components/CaseProgressTracker';
import GpsCapture from '../components/GpsCapture';

/* ── Case Detail View ───────────────────────────────────────── */
const CaseDetail = ({ id }) => {
  const [caseData, setCaseData] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const [caseRes, evidenceRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/cases/${id}`),
          axios.get(`http://localhost:5000/api/evidence/case/${id}`)
        ]);
        setCaseData(caseRes.data);
        setEvidenceList(evidenceRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCaseDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-secondary">Loading Case Details...</div>;
  if (!caseData) return <div className="p-8 text-center text-secondary">Case not found.</div>;

  return (
    <div className="case-detail">
      {/* Back + Actions header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Link to="/cases" className="text-secondary hover:text-primary">
            <ChevronRight className="rotate-180" />
          </Link>
          Case ID: {caseData.firNumber}
        </h2>
        <div className="flex gap-3">
          <Link to={`/evidence/upload?caseId=${caseData._id}`} className="btn btn-primary">
            <FileText size={16} /> Add Evidence
          </Link>
        </div>
      </div>

      <div className="grid-layout-2-1">
        {/* Left: Case info + Evidence */}
        <div className="flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Case Info Card */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="case-icon-bg bg-primary-soft text-primary"><Database size={24} /></div>
                <div>
                  <h3 className="font-semibold text-lg">{caseData.title}</h3>
                  <div className="text-sm text-secondary flex items-center gap-2 mt-1">
                    <User size={14} /> Assigned to: {caseData.assignedOfficer?.name || 'Unknown'}
                  </div>
                </div>
              </div>
              <span className={`status-badge status-${(caseData.status || 'open').toLowerCase().replace(/ /g, '-')}`}>
                {caseData.status || 'Open'}
              </span>
            </div>

            {caseData.description && (
              <p className="text-sm text-secondary mb-4">{caseData.description}</p>
            )}

            <div className="case-meta mt-4 pt-4 border-t border-color flex justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs text-secondary mb-1">📅 Registered At</div>
                <div className="font-medium flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-primary" />
                  {new Date(caseData.registeredAt || caseData.createdAt).toLocaleString('en-IN', {
                    day:'2-digit', month:'short', year:'numeric',
                    hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">Evidence Files</div>
                <div className="font-medium">{evidenceList.length} secured records</div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">Station Code</div>
                <div className="font-medium font-mono text-sm">{caseData.stationCode}</div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-1">Integrity</div>
                <div className="font-medium text-xs font-mono text-green-400 flex items-center gap-1">
                  <Shield size={12} /> SEALED
                </div>
              </div>
            </div>
            {/* GPS Location recorded at FIR time */}
            {caseData.location?.lat && (
              <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'rgba(74,222,128,0.05)', borderRadius: '10px', border: '1px solid rgba(74,222,128,0.15)' }}>
                <div className="text-xs text-secondary mb-2" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📍 GPS Location at FIR Registration</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#4ade80' }}>
                  {caseData.location.lat.toFixed(6)}, {caseData.location.lng.toFixed(6)}
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>± {caseData.location.accuracy}m</span>
                </div>
                {caseData.location.address && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>{caseData.location.address}</div>
                )}
                {caseData.location.capturedAt && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    🕐 GPS captured: {new Date(caseData.location.capturedAt).toLocaleString()}
                  </div>
                )}
                <button
                  type="button"
                  style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#4ade80', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => window.open(`https://www.google.com/maps?q=${caseData.location.lat},${caseData.location.lng}&z=17`, '_blank')}
                >
                  View on Google Maps →
                </button>
              </div>
            )}
          </div>

          {/* Evidence Vault Preview */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Digital Evidence Vault</h3>
              <Link to={`/evidence`} className="text-sm text-primary hover:underline">View All →</Link>
            </div>

            <div className="evidence-grid">
              {evidenceList.length > 0 ? evidenceList.slice(0, 4).map((ev, idx) => (
                <div key={ev._id || idx} className="evidence-card text-center p-3 bg-black/20 rounded-lg border border-white/5 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="w-full h-20 bg-gray-800 rounded mb-2 flex items-center justify-center relative overflow-hidden">
                    <img src={ev.cloudinaryUrl} alt="Evidence" className="opacity-50 object-cover w-full h-full" />
                    <div className="absolute bg-black/60 p-1 rounded"><Shield size={14} className="text-green-400" /></div>
                  </div>
                  <div className="text-xs font-medium truncate">{ev.description || 'Evidence'}</div>
                  <div className="text-[10px] text-green-400 mt-1 flex items-center justify-center gap-1">🔒 Sealed</div>
                </div>
              )) : (
                <div className="col-span-4 text-center py-6 text-secondary text-sm">
                  No evidence uploaded yet. Click "Add Evidence" to begin.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Full Cross-Level Progress Tracker */}
        <div className="glass-card p-6">
          <CaseProgressTracker
            caseData={caseData}
            evidenceCount={evidenceList.length}
            hasForensicReport={false}
          />
        </div>
      </div>
    </div>
  );
};

/* ── Cases List View ────────────────────────────────────────── */
const Cases = ({ view }) => {
  const { id } = useParams();
  const [cases, setCases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newCaseData, setNewCaseData] = useState({ firNumber: '', title: '', description: '' });
  const [caseGpsLocation, setCaseGpsLocation] = useState(null);

  useEffect(() => { fetchCases(); }, []);

  const fetchCases = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/cases');
      setCases(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const userStr = localStorage.getItem('thana2_user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      await axios.post('http://localhost:5000/api/cases', {
        ...newCaseData,
        stationCode: userObj?.stationCode || 'DEFAULT-01',
        location: caseGpsLocation || undefined,
        registeredAt: new Date().toISOString(),
      });
      setShowForm(false);
      setNewCaseData({ firNumber: '', title: '', description: '' });
      setCaseGpsLocation(null);
      fetchCases();
    } catch (err) {
      alert('Error creating case. Ensure FIR Number is unique.');
    }
  };

  if (view === 'detail' || id) return <CaseDetail id={id} />;

  return (
    <div className="cases-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Case Directory</h1>
          <p className="text-secondary text-sm">Manage and track secure case files</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> New Case File
        </button>
      </div>

      {showForm && (
        <form className="glass-card mb-6 p-6" onSubmit={handleCreateCase}>
          <h3 className="font-semibold text-lg mb-4">Register New FIR Case</h3>
          <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label className="text-xs text-secondary">FIR Number</label>
              <input type="text" className="input-field mt-1" required placeholder="e.g. FIR-2026-001"
                value={newCaseData.firNumber} onChange={e => setNewCaseData({ ...newCaseData, firNumber: e.target.value })} />
            </div>
            <div style={{ flex: 2, minWidth: '200px' }}>
              <label className="text-xs text-secondary">Case Title</label>
              <input type="text" className="input-field mt-1" required placeholder="e.g. Robbery at Main Street"
                value={newCaseData.title} onChange={e => setNewCaseData({ ...newCaseData, title: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-secondary">Initial Description</label>
            <textarea className="input-field mt-1" rows="2"
              value={newCaseData.description} onChange={e => setNewCaseData({ ...newCaseData, description: e.target.value })} />
          </div>

          {/* GPS Capture — auto captures when form opens */}
          <div style={{ marginTop: '1rem' }}>
            <GpsCapture
              label="Inspector GPS Location (FIR Registration)"
              autoCapture={true}
              onLocation={(loc) => setCaseGpsLocation(loc)}
            />
          </div>

          {/* Registration Timestamp (locked, shows current time) */}
          <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.875rem', background: 'rgba(79,106,240,0.06)', borderRadius: '8px', border: '1px solid rgba(79,106,240,0.15)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={13} style={{ color: '#7B9BFF', flexShrink: 0 }} />
            <span>Registration timestamp will be sealed at: <strong style={{ color: 'white' }}>{new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true })}</strong></span>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {caseGpsLocation ? '📍 Save with GPS Location' : 'Save to Database'}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="glass-card p-4 mb-6 flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
        <div className="search-box flex-1 flex items-center gap-2 bg-black/20 p-2 px-4 rounded-lg border border-white/5" style={{ minWidth: '200px' }}>
          <Search size={16} className="text-secondary" />
          <input type="text" placeholder="Search by FIR No, title, officer..." className="bg-transparent border-none text-white w-full outline-none text-sm" />
        </div>
        <button className="btn btn-outline bg-black/20"><Filter size={16} /> Filters</button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="admin-cases-table">
          <table className="cases-table w-full">
            <thead>
              <tr>
                <th>FIR No.</th>
                <th>Case Title</th>
                <th>Officer</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Progress</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-secondary">
                    No Cases Found. Start by registering a new FIR.
                  </td>
                </tr>
              ) : (
                cases.map((c) => {
                  // Quick inline progress label
                  const statusOrder = ['Open', 'Under Investigation', 'Evidence Uploaded', 'Forensic Analysis', 'Court Trial', 'Closed'];
                  const pct = Math.round(((statusOrder.indexOf(c.status) + 1) / statusOrder.length) * 100) || 10;
                  return (
                    <tr key={c._id}>
                      <td className="font-medium text-primary font-mono">
                        <Link to={`/cases/${c._id}`}>{c.firNumber}</Link>
                      </td>
                      <td className="font-medium">{c.title}</td>
                      <td className="text-sm text-secondary">
                        <div className="flex items-center gap-1"><User size={12} />{c.assignedOfficer?.name || 'Local Officer'}</div>
                      </td>
                      <td>
                        <span className={`status-badge status-${(c.status || 'open').toLowerCase().replace(/ /g, '-')}`}>
                          {c.status || 'Open'}
                        </span>
                      </td>
                      <td className="text-sm text-secondary">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        {/* Mini progress bar */}
                        <div style={{ width: '80px' }}>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #4f6af0, #4ade80)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                          </div>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>{pct}%</div>
                        </div>
                      </td>
                      <td>
                        <Link to={`/cases/${c._id}`}>
                          <button className="btn btn-outline" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}>View →</button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Cases;
