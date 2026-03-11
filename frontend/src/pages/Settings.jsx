import { useState, useEffect } from 'react';
import { 
  User, Shield, Bell, Eye, Lock, Globe, 
  Save, AlertCircle, Laptop, Landmark, Info
} from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({ name: '', role: '', officerId: '', stationCode: '' });
  const [success, setSuccess] = useState(false);

  // Form states
  const [notifications, setNotifications] = useState({
    caseUpdates: true,
    evidenceAlerts: true,
    systemLogs: false
  });

  const [appearance, setAppearance] = useState({
    darkMode: true,
    glassmorphism: true,
    animations: true
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('thana2_user') || '{}');
    setUser(savedUser);
  }, []);

  const handleSave = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const TabButton = ({ id, icon: Icon, label }) => (
    <button 
      className={`settings-tab ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="settings-page">
      {/* Hero Header */}
      <div className="settings-hero">
        <div className="settings-avatar-wrap">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name || 'System User'}</h1>
          <p className="text-secondary text-sm">
            {user.role === 'admin' ? 'Superintendent' : user.role === 'forensic' ? 'Forensic Officer' : 'Inspector'} · ID: {user.officerId || 'N/A'}
          </p>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            <span className="role-tag" style={{ background: 'rgba(79, 106, 240, 0.15)', color: '#7B9BFF', border: '1px solid rgba(79, 106, 240, 0.3)' }}>
              {user.role?.toUpperCase()} ACCESS
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <TabButton id="profile" icon={User} label="Profile Details" />
        <TabButton id="security" icon={Shield} label="Account Security" />
        <TabButton id="preferences" icon={Bell} label="System Preferences" />
      </div>

      <div className="settings-grid">
        {/* Main Content Area */}
        <div className="flex flex-col gap-6">
          
          {activeTab === 'profile' && (
            <div className="settings-card">
              <h2 className="settings-section-title"><User size={20} className="text-primary" /> Personnel Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="settings-form-group">
                  <label>Full Name</label>
                  <input type="text" className="settings-input" value={user.name} disabled />
                </div>
                <div className="settings-form-group">
                  <label>Officer Designation</label>
                  <input type="text" className="settings-input" value={user.role?.toUpperCase()} disabled />
                </div>
                <div className="settings-form-group">
                  <label>Officer ID (Immutable)</label>
                  <input type="text" className="settings-input" value={user.officerId} disabled />
                </div>
                <div className="settings-form-group">
                  <label>Station Assignment</label>
                  <div className="flex items-center gap-2 settings-input bg-black/40">
                    <Landmark size={14} className="text-primary" />
                    <span>{user.stationCode || 'CENTRAL-HQ-01'}</span>
                  </div>
                </div>
              </div>
              <div className="support-banner">
                <p className="text-xs text-secondary flex items-center gap-2">
                  <Info size={14} className="text-primary" /> 
                  Personnel record changes must be authorized by the IT Administrator and verified via biometric override.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-card">
              <h2 className="settings-section-title"><Shield size={20} className="text-primary" /> Security & Privacy</h2>
              <div className="settings-form-group">
                <label>Update Password</label>
                <input type="password" placeholder="Current Password" className="settings-input mb-3" />
                <input type="password" placeholder="New Password" className="settings-input mb-3" />
                <input type="password" placeholder="Confirm New Password" className="settings-input" />
              </div>
              
              <div className="settings-toggle-row">
                <div>
                  <div className="font-medium text-sm">Two-Factor Authentication</div>
                  <div className="text-xs text-secondary">Require bio-metric scan for high-level actions.</div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-toggle-row">
                <div>
                  <div className="font-medium text-sm">Session Timeout</div>
                  <div className="text-xs text-secondary">Auto logout after 30 minutes of inactivity.</div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="settings-card">
              <h2 className="settings-section-title"><Bell size={20} className="text-primary" /> System & Notifications</h2>
              
              <div className="mb-6">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Notification Settings</h3>
                <div className="settings-toggle-row">
                  <div className="text-sm">Case Status Updates</div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notifications.caseUpdates} onChange={e => setNotifications({...notifications, caseUpdates: e.target.checked})} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-toggle-row">
                  <div className="text-sm">Evidence Integrity Alerts</div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notifications.evidenceAlerts} onChange={e => setNotifications({...notifications, evidenceAlerts: e.target.checked})} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-toggle-row">
                  <div className="text-sm">System Logs & Audit Reports</div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notifications.systemLogs} onChange={e => setNotifications({...notifications, systemLogs: e.target.checked})} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">UI Preferences</h3>
                <div className="settings-toggle-row">
                  <div className="text-sm">Dynamic Animations</div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={appearance.animations} onChange={e => setAppearance({...appearance, animations: e.target.checked})} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-toggle-row">
                  <div className="text-sm">High Fidelity Glassmorphism</div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={appearance.glassmorphism} onChange={e => setAppearance({...appearance, glassmorphism: e.target.checked})} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-secondary italic">Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <button className="settings-btn-save" onClick={handleSave}>
              <Save size={18} />
              {success ? 'Changes Applied ✓' : 'Save All Changes'}
            </button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-6">
          <div className="settings-card" style={{ background: 'rgba(79, 106, 240, 0.05)', borderColor: 'rgba(79, 106, 240, 0.2)' }}>
            <h3 className="font-bold flex items-center gap-2 mb-3">
              <Laptop size={18} className="text-primary" /> Device Security
            </h3>
            <div className="text-xs text-secondary mb-4">
              Your account is currently active on this terminal only.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="p-3 bg-black/30 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-medium text-xs">Standard PC (Current)</div>
                  <div className="text-[10px] text-primary">Windows · Chrome</div>
                </div>
                <span className="status-badge status-open" style={{ fontSize: '10px' }}>Active</span>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <h3 className="font-bold flex items-center gap-2 mb-3">
              <Globe size={18} className="text-primary" /> Station Meta
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-secondary">Network Status:</span>
                <span className="text-green-400 font-mono">ENCRYPTED</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-secondary">IP Address:</span>
                <span className="text-primary font-mono">192.168.1.107</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-secondary">System Ver:</span>
                <span className="text-primary font-mono">v2.0.4-STABLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
