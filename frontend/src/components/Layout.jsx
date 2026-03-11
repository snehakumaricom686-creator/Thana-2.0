import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  FolderOpenDot,
  Files,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Microscope,
  Crown,
  Menu,
  X
} from 'lucide-react';
import './Layout.css';

const Layout = ({ setAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ name: 'Officer', officerId: 'Demo', role: 'inspector' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('thana2_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const getInitials = (name) => {
    if (!name) return 'OF';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('thana2_token');
    localStorage.removeItem('thana2_user');
    setAuth(false);
    navigate('/login');
  };

  const inspectorNav = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/cases', icon: <FolderOpenDot size={20} />, label: 'My Cases' },
    { to: '/evidence', icon: <Files size={20} />, label: 'Evidence Vault' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const forensicNav = [
    { to: '/', icon: <Microscope size={20} />, label: 'Forensic Lab' },
    { to: '/evidence', icon: <Files size={20} />, label: 'Evidence Vault' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const adminNav = [
    { to: '/', icon: <Crown size={20} />, label: 'Command Center' },
    { to: '/cases', icon: <FolderOpenDot size={20} />, label: 'All Cases' },
    { to: '/evidence', icon: <Files size={20} />, label: 'Evidence Vault' },
    { to: '/reports', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const navItems = user.role === 'admin' ? adminNav : user.role === 'forensic' ? forensicNav : inspectorNav;

  const roleBadgeStyle = {
    admin:    { bg: 'rgba(229,84,84,0.12)',  color: '#e55454', border: 'rgba(229,84,84,0.3)',  label: 'Superintendent' },
    forensic: { bg: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'rgba(74,222,128,0.3)', label: 'Forensic Officer' },
    inspector:{ bg: 'rgba(79,106,240,0.12)', color: '#4f6af0', border: 'rgba(79,106,240,0.3)', label: 'Inspector' },
  };
  const rb = roleBadgeStyle[user.role] || roleBadgeStyle.inspector;

  return (
    <div className="app-container">

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="logo-area">
          <div className="logo-icon">
            <ShieldAlert size={24} />
          </div>
          <span className="logo-text">थाना<span style={{ color: 'var(--text-secondary)', fontWeight: 300 }}> 2.0</span></span>
          {/* Close btn on mobile */}
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* User Profile */}
        <div className="user-profile-sm">
          <div className="avatar" style={{ background: rb.bg, color: rb.color, border: `1px solid ${rb.border}` }}>
            {getInitials(user.name)}
          </div>
          <div className="flex-col" style={{ minWidth: 0 }}>
            <span className="text-sm" style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
            <span className="text-xs" style={{ color: rb.color, fontWeight: 600 }}>{rb.label}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>ID: {user.officerId}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="nav-links">
          <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>
            {user.role === 'admin' ? 'Command Center' : user.role === 'forensic' ? 'Forensic Portal' : 'Inspector Portal'}
          </div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1.25rem' }}>
          <button onClick={handleLogout} className="btn btn-outline w-full justify-center">
            <LogOut size={16} /> Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-nav">
          {/* Hamburger — mobile only */}
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          {/* Logo on mobile top bar */}
          <span className="mobile-logo">थाना 2.0</span>

          <div className="flex items-center gap-3 ml-auto">
            <div className="search-bar">
              <Search size={15} className="text-secondary" style={{ flexShrink: 0 }} />
              <input type="text" placeholder="Search cases, evidence..." />
            </div>
            <button className="icon-btn relative">
              <Bell size={19} />
              <span className="badge">0</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
