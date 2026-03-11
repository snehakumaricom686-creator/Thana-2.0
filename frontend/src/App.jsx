import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import EvidenceVault from './pages/EvidenceVault';
import Login from './pages/Login';
import ForensicDashboard from './pages/ForensicDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('inspector');

  useEffect(() => {
    const token = localStorage.getItem('thana2_token');
    const userStr = localStorage.getItem('thana2_user');
    if (token) {
      setIsAuthenticated(true);
      if (userStr) {
        const u = JSON.parse(userStr);
        setUserRole(u.role || 'inspector');
      }
    }
  }, []);

  // When auth state changes, re-read role
  const handleSetAuth = (val) => {
    setIsAuthenticated(val);
    if (val) {
      const userStr = localStorage.getItem('thana2_user');
      if (userStr) setUserRole(JSON.parse(userStr).role || 'inspector');
    }
  };

  // Pick root "/" component by role
  const HomeDashboard = () => {
    if (userRole === 'admin')    return <AdminDashboard />;
    if (userRole === 'forensic') return <ForensicDashboard />;
    return <Dashboard />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login setAuth={handleSetAuth} /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route element={isAuthenticated ? <Layout setAuth={handleSetAuth} /> : <Navigate to="/login" />}>
          <Route path="/" element={<HomeDashboard />} />

          {/* Inspector routes */}
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:id" element={<Cases view="detail" />} />

          {/* Evidence — all roles */}
          <Route path="/evidence" element={<EvidenceVault />} />
          <Route path="/evidence/upload" element={<EvidenceVault view="upload" />} />

          {/* Admin-only */}
          <Route path="/reports" element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
