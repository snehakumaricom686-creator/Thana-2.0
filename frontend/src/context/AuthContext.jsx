import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('thana2_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('thana2_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('thana2_token');
    localStorage.removeItem('thana2_user');
  };

  // role helpers
  const isAdmin    = user?.role === 'admin';
  const isForensic = user?.role === 'forensic';
  const isInspector = user?.role === 'inspector';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isForensic, isInspector }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
