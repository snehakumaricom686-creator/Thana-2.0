import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, Target, Star } from 'lucide-react';
import axios from 'axios';
import './Login.css';

const ROLES = [
  { value: 'inspector', label: '🔵 Normal Inspector', desc: 'Register FIR cases, view & upload evidence' },
  { value: 'forensic', label: '🟢 Forensic Team Officer', desc: 'Analyze evidence, generate forensic reports' },
  { value: 'admin', label: '🔴 High Authorized Officer (Superintendent / Admin)', desc: 'Full access — manage all officers, cases, FIRs' },
];

const Login = ({ setAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [stationCode, setStationCode] = useState('');
  const [role, setRole] = useState('inspector');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin
        ? 'http://localhost:5000/api/auth/login'
        : 'http://localhost:5000/api/auth/register';

      const payload = isLogin
        ? { officerId, password, stationCode }
        : { name, officerId, password, stationCode, role };

      const response = await axios.post(endpoint, payload);

      if (isLogin) {
        localStorage.setItem('thana2_token', response.data.token);
        localStorage.setItem('thana2_user', JSON.stringify(response.data.user));
        setAuth(true);
        navigate('/');
      } else {
        setIsLogin(true);
        setError('✅ Officer ID created successfully! Please login now.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Connection Error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay"></div>

      <div className="login-card glass-card">
        <div className="login-header text-center">
          <div className="login-logo-icon">
            <ShieldCheck size={48} />
          </div>
          <h1>थाना 2.0</h1>
          <p className="subtitle">DIGITAL EVIDENCE &amp; CASE MANAGEMENT SYSTEM</p>
        </div>

        <form onSubmit={handleAuth} className="login-form">
          {error && (
            <div className={error.includes('✅') ? 'success-message' : 'error-message'}>
              {error}
            </div>
          )}

          {/* Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded ${isLogin ? 'bg-primary text-white' : 'bg-transparent text-secondary border border-gray-600'}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Login
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded ${!isLogin ? 'bg-primary text-white' : 'bg-transparent text-secondary border border-gray-600'}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Create New ID
            </button>
          </div>

          {/* Registration-only fields */}
          {!isLogin && (
            <div>
              <div className="input-group">
                <label htmlFor="name">Full Name</label>
                <div className="password-wrapper">
                  <input
                    type="text"
                    id="name"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                  />
                  <User size={18} className="lock-icon text-secondary" />
                </div>
              </div>

              <div className="input-group">
                <label>
                  <Star size={14} className="inline mr-1 text-yellow-400" />
                  Officer Rank / Department
                </label>
                <select
                  className="input-field select-arrow"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <p className="text-xs text-secondary mt-1">
                  {ROLES.find(r => r.value === role)?.desc}
                </p>
              </div>
            </div>
          )}

          {/* Common fields */}
          <div className="input-group">
            <label htmlFor="officerId">Officer ID (Batch No.)</label>
            <div className="password-wrapper">
              <input
                type="text"
                id="officerId"
                className="input-field"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                placeholder="e.g. 2000341"
                required
              />
              <Target size={18} className="lock-icon text-secondary" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="stationCode">Police Station Code</label>
            <input
              type="text"
              id="stationCode"
              className="input-field"
              value={stationCode}
              onChange={(e) => setStationCode(e.target.value.toUpperCase())}
              placeholder="e.g. PS-DL-02"
              required
            />
            <p className="text-xs text-secondary mt-1">Ask your senior for the correct station code.</p>
          </div>

          <div className="input-group">
            <label htmlFor="password">Secret Password</label>
            <div className="password-wrapper">
              <input
                type="password"
                id="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Lock size={18} className="lock-icon text-secondary" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full login-btn mt-4" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'SECURE LOGIN' : 'CREATE OFFICER ID')}
          </button>

          <div className="text-center mt-4">
            <a href="#" className="forgot-password text-xs text-secondary">Forgot Password? Contact IT Admin</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
