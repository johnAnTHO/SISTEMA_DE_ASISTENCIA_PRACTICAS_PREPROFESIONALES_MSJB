
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import Login from './components/Login';
import PracticantDashboard from './components/PracticantDashboard';
import AdminDashboard from './components/AdminDashboard';
import axios from 'axios';

// Configurar interceptor global para incluir el token en todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-access-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import AttendanceTerminal from './components/AttendanceTerminal';

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <Router>
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
      <Routes>
        <Route path="/terminal" element={<AttendanceTerminal />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/practicant/*"
          element={user?.role === 'PRACTICANT' ? <PracticantDashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/*"
          element={user?.role === 'ADMIN' ? <AdminDashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
