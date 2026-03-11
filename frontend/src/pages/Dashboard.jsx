import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FolderOpenDot, 
  Files, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Plus,
  FileText
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [user, setUser] = useState({ name: 'Officer', officerId: '', role: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storedUser = localStorage.getItem('thana2_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        const [casesRes, evidenceRes] = await Promise.all([
          axios.get('http://localhost:5000/api/cases').catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/evidence').catch(() => ({ data: [] }))
        ]);
        
        setCases(casesRes.data || []);
        setEvidence(evidenceRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const generateChartPath = (count, max, color) => {
    if (count === 0) return <line x1="0" y1="140" x2="500" y2="140" stroke={color} strokeWidth="2" />;
    const points = [];
    points.push(`0,140`);
    const step = 500 / count;
    for (let i = 0; i < count; i++) {
      const x = (i + 1) * step;
      const y = 140 - (Math.random() * 80 + 20);
      points.push(`${x},${y}`);
    }
    return <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Welcome, {user.name}</h1>
          <p className="text-secondary text-sm">THANA 2.0 — DIGITAL EVIDENCE & CASE MANAGEMENT</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid mb-8">
        <div className="stat-card glass-card relative overflow-hidden">
          <div className="stat-icon bg-primary-soft text-primary">
            <FolderOpenDot size={24} />
          </div>
          <div className="stat-content">
            <h2 className="text-3xl font-bold">{loading ? '...' : cases.length}</h2>
            <p className="text-secondary text-sm">Active Cases</p>
          </div>
          {cases.length > 0 && <div className="stat-trend trend-up">+{cases.length} Total</div>}
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon bg-blue-soft text-blue">
            <Files size={24} />
          </div>
          <div className="stat-content">
            <h2 className="text-3xl font-bold">{loading ? '...' : evidence.length}</h2>
            <p className="text-secondary text-sm">New Evidence</p>
          </div>
          <Link to="/evidence/upload"><button className="add-btn"><Plus size={16} /></button></Link>
        </div>

        <div className="stat-card glass-card border-warning">
          <div className="stat-icon bg-warning-soft text-warning">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <h2 className="text-3xl font-bold">0</h2>
            <p className="text-secondary text-sm">Pending Tasks</p>
          </div>
        </div>

        <div className="stat-card glass-card border-danger">
          <div className="stat-icon bg-danger-soft text-danger">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h2 className="text-3xl font-bold">0</h2>
            <p className="text-secondary text-sm">Urgent Alerts</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        {/* Activity Overview */}
        <div className="glass-card p-6 col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Case Activity Overview</h3>
            <div className="text-xs text-secondary flex gap-2">
              <span className="cursor-pointer text-primary">Last 7 Days</span>
              <span className="cursor-pointer">Last 30 Days</span>
            </div>
          </div>
          <div className="mock-chart-container">
            <svg viewBox="0 0 500 150" className="mock-chart w-full h-full">
              {cases.length > 0 ? generateChartPath(cases.length, 50, 'var(--primary)') : generateChartPath(0, 0, 'var(--primary)')}
              {evidence.length > 0 ? generateChartPath(evidence.length, 50, 'var(--accent-warning)') : generateChartPath(0, 0, 'var(--accent-warning)')}
              <line x1="0" y1="30"  x2="500" y2="30"  stroke="rgba(255,255,255,0.05)" />
              <line x1="0" y1="75"  x2="500" y2="75"  stroke="rgba(255,255,255,0.05)" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.05)" />
            </svg>
            <div className="chart-legend mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2 text-xs text-secondary">
                <div className="legend-dot bg-primary"></div> Resolved Cases
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary">
                <div className="legend-dot bg-warning"></div> New Evidence
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          <div className="action-list">
            <Link to="/cases" className="action-item">
              <div className="action-icon bg-primary-soft text-primary"><ShieldAlert size={18} /></div>
              <div className="text-left w-full">
                <div className="font-medium text-sm">Register New FIR</div>
                <div className="text-xs text-secondary">Create a digital case file in the database</div>
              </div>
              <Plus size={16} className="text-secondary" />
            </Link>
            <Link to="/evidence/upload" className="action-item">
              <div className="action-icon bg-blue-soft text-blue"><FileText size={18} /></div>
              <div className="text-left w-full">
                <div className="font-medium text-sm">Upload Evidence</div>
                <div className="text-xs text-secondary">Secure vault storage with hash verification</div>
              </div>
              <Plus size={16} className="text-secondary" />
            </Link>
            <button className="action-item">
              <div className="action-icon bg-warning-soft text-warning"><Activity size={18} /></div>
              <div className="text-left w-full">
                <div className="font-medium text-sm">View Urgent Alerts</div>
                <div className="text-xs text-secondary">No pending tasks right now</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
