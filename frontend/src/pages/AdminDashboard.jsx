import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import {
  Crown, FolderOpen, ShieldCheck,
  Edit3, CheckCircle, XCircle, AlertTriangle, BarChart3
} from 'lucide-react';
import './ForensicDashboard.css';
import './AdminDashboard.css';
import CaseProgressTracker from '../components/CaseProgressTracker';

const STATUS_ORDER = ['Open','Under Investigation','Evidence Uploaded','Forensic Analysis','Forensic Report','Court Trial','Closed'];

const AdminDashboard = () => {
  const [cases, setCases] = useState([]);
  const [tab, setTab] = useState('cases');
  const [loading, setLoading] = useState(true);
  const [editCase, setEditCase] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [expandedCase, setExpandedCase] = useState(null);
  const [stats, setStats] = useState({ cases: 0, evidence: 0 });

  const user = JSON.parse(localStorage.getItem('thana2_user') || '{}');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [casesRes, evidenceRes] = await Promise.all([
        axios.get(`${API_URL}/api/cases`),
        axios.get(`${API_URL}/api/evidence`),
      ]);
      setCases(casesRes.data || []);
      setStats({ cases: casesRes.data.length, evidence: evidenceRes.data.length });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateCaseStatus = async (caseId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/cases/${caseId}`, { status: newStatus });
      setCases(prev => prev.map(c => c._id === caseId ? { ...c, status: newStatus } : c));
      setEditCase(null);
    } catch (e) {
      alert('Error updating case status.');
    }
  };

  const closeCase = async (caseId) => {
    if (!window.confirm('Mark this case as CLOSED? Core case data will remain permanently sealed.')) return;
    await updateCaseStatus(caseId, 'Closed');
  };

  const statusColors = {
    'Open': 'text-blue-400',
    'Under Investigation': 'text-yellow-400',
    'Closed': 'text-green-400',
    'Court Trial': 'text-orange-400',
    'Evidence Uploaded': 'text-teal-400',
    'Forensic Analysis': 'text-purple-400',
    'Forensic Report': 'text-pink-400',
  };

  return (
    <div className="admin-dashboard">

      {/* Hero */}
      <div className="forensic-hero glass-card" style={{ borderLeftColor: '#e55454', background: 'linear-gradient(135deg, rgba(229,84,84,0.05), transparent)' }}>
        <div className="forensic-hero-badge" style={{ background: 'rgba(229,84,84,0.1)', borderColor: 'rgba(229,84,84,0.3)' }}>
          <Crown size={36} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Superintendent Command Center</h1>
          <p className="text-secondary text-sm">Welcome, <strong>{user.name}</strong> — Highest Privilege Access</p>
          <div className="role-tag admin-tag">🔴 High Authorized Officer</div>
        </div>
      </div>

      {/* Stats */}
      <div className="forensic-stats">
        <div className="stat-item glass-card">
          <FolderOpen size={22} className="text-primary" />
          <div><div className="stat-num">{stats.cases}</div><div className="stat-label">Total Case Files</div></div>
        </div>
        <div className="stat-item glass-card">
          <ShieldCheck size={22} className="text-green-400" />
          <div><div className="stat-num">{stats.evidence}</div><div className="stat-label">Evidence Records</div></div>
        </div>
        <div className="stat-item glass-card">
          <CheckCircle size={22} className="text-yellow-400" />
          <div><div className="stat-num">{cases.filter(c => c.status === 'Closed').length}</div><div className="stat-label">Cases Closed</div></div>
        </div>
        <div className="stat-item glass-card">
          <AlertTriangle size={22} className="text-red-400" />
          <div><div className="stat-num">{cases.filter(c => c.status !== 'Closed').length}</div><div className="stat-label">Active / Pending</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-4">
        <div className="flex gap-3">
          {[
            { key: 'cases', icon: <FolderOpen size={16} />, label: 'All Case Files' },
            { key: 'reports', icon: <BarChart3 size={16} />, label: 'System Analytics' },
          ].map(t => (
            <button key={t.key} className={`admin-tab flex items-center gap-2 ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Table */}
      {tab === 'cases' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="font-bold flex items-center gap-2"><FolderOpen size={18} className="text-primary" /> All Registered Cases</h2>
            <span className="text-xs text-secondary">{cases.length} records · Click row to view progress</span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-secondary">Loading database records...</div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center text-secondary">
              <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p>No case files registered yet.</p>
            </div>
          ) : (
            <div className="admin-cases-table">
              <table className="cases-table w-full">
                <thead>
                  <tr>
                    <th>FIR No. 🔒</th>
                    <th>Case Title 🔒</th>
                    <th>Officer</th>
                    <th>Status</th>
                    <th>Date Sealed</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map(c => {
                    const pct = Math.round(((STATUS_ORDER.indexOf(c.status) + 1) / STATUS_ORDER.length) * 100) || 10;
                    return (
                      <React.Fragment key={c._id}>
                        {/* Main row — click to expand tracker */}
                        <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedCase(expandedCase === c._id ? null : c._id)}>
                          <td className="font-mono text-primary text-sm">{c.firNumber}</td>
                          <td className="font-medium">{c.title}</td>
                          <td className="text-secondary text-sm">{c.assignedOfficer?.name || 'Unassigned'}</td>
                          <td>
                            {editCase === c._id ? (
                              <select
                                className="input-field text-xs py-1 px-2"
                                style={{ width: 'auto', background: 'rgba(0,0,0,0.4)' }}
                                value={editStatus}
                                onChange={e => setEditStatus(e.target.value)}
                                onClick={e => e.stopPropagation()}
                              >
                                {STATUS_ORDER.map(s => <option key={s}>{s}</option>)}
                              </select>
                            ) : (
                              <span className={`text-xs font-semibold ${statusColors[c.status] || 'text-secondary'}`}>
                                {c.status || 'Open'}
                              </span>
                            )}
                          </td>
                          <td className="text-secondary text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div style={{ width: '70px' }}>
                              <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#4f6af0,#4ade80)', transition: 'width 0.4s ease' }} />
                              </div>
                              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>{pct}%</div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                              {editCase === c._id ? (
                                <>
                                  <button className="admin-action-btn green" title="Confirm" onClick={() => updateCaseStatus(c._id, editStatus)}>
                                    <CheckCircle size={14} />
                                  </button>
                                  <button className="admin-action-btn gray" title="Cancel" onClick={() => setEditCase(null)}>
                                    <XCircle size={14} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  {c.status !== 'Closed' && (
                                    <button className="admin-action-btn blue" title="Update Status"
                                      onClick={() => { setEditCase(c._id); setEditStatus(c.status || 'Open'); }}>
                                      <Edit3 size={14} />
                                    </button>
                                  )}
                                  {c.status !== 'Closed' && (
                                    <button className="admin-action-btn red" title="Close Case" onClick={() => closeCase(c._id)}>
                                      <XCircle size={14} />
                                    </button>
                                  )}
                                  {c.status === 'Closed' && (
                                    <span className="text-xs text-green-400 flex items-center gap-1">
                                      <CheckCircle size={12} /> Sealed
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expandable tracker row */}
                        {expandedCase === c._id && (
                          <tr>
                            <td colSpan="7" style={{ padding: 0, background: 'rgba(79,106,240,0.03)', borderBottom: '1px solid rgba(79,106,240,0.12)' }}>
                              <div style={{ padding: '1.5rem' }}>
                                <CaseProgressTracker
                                  caseData={c}
                                  evidenceCount={0}
                                  hasForensicReport={false}
                                  compact={false}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {tab === 'reports' && (
        <div className="glass-card p-8 text-center">
          <BarChart3 size={48} className="text-primary mx-auto mb-4 opacity-60" />
          <h3 className="text-xl font-bold mb-2">System Analytics</h3>
          <div className="grid-cols-2-eq mt-6">
            <div className="analytics-box">
              <div className="text-4xl font-bold text-primary">{stats.cases}</div>
              <div className="text-secondary mt-1">Total Cases Registered</div>
            </div>
            <div className="analytics-box">
              <div className="text-4xl font-bold text-green-400">{stats.evidence}</div>
              <div className="text-secondary mt-1">Evidence Files in Vault</div>
            </div>
            <div className="analytics-box">
              <div className="text-4xl font-bold text-yellow-400">{cases.filter(c => c.status === 'Under Investigation').length}</div>
              <div className="text-secondary mt-1">Under Investigation</div>
            </div>
            <div className="analytics-box">
              <div className="text-4xl font-bold text-red-400">{cases.filter(c => c.status === 'Court Trial').length}</div>
              <div className="text-secondary mt-1">In Court Trial</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
