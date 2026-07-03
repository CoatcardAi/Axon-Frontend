import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import DashboardLayout from './pages/DashboardLayout';
import KeysPage from './pages/KeysPage';
import ModelsPage from './pages/ModelsPage';
import MappingsPage from './pages/MappingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LogsPage from './pages/LogsPage';
import SandboxPage from './pages/SandboxPage';
import GuidePage from './pages/GuidePage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('axon_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('axon_username') || '');
  const [roles, setRoles] = useState(JSON.parse(localStorage.getItem('axon_roles') || '[]'));
  const [profile, setProfile] = useState({
    name: localStorage.getItem('axon_name') || '',
    dob: localStorage.getItem('axon_dob') || '',
    age: localStorage.getItem('axon_age') || '',
    gender: localStorage.getItem('axon_gender') || '',
  });

  const handleLoginSuccess = (jwt, user, userRoles, name, dob, age, gender) => {
    localStorage.setItem('axon_token', jwt);
    localStorage.setItem('axon_username', user);
    localStorage.setItem('axon_roles', JSON.stringify(userRoles));
    localStorage.setItem('axon_name', name || '');
    localStorage.setItem('axon_dob', dob || '');
    localStorage.setItem('axon_age', age ? String(age) : '');
    localStorage.setItem('axon_gender', gender || '');
    
    setToken(jwt);
    setUsername(user);
    setRoles(userRoles);
    setProfile({
      name: name || '',
      dob: dob || '',
      age: age ? String(age) : '',
      gender: gender || '',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('axon_token');
    localStorage.removeItem('axon_username');
    localStorage.removeItem('axon_roles');
    localStorage.removeItem('axon_name');
    localStorage.removeItem('axon_dob');
    localStorage.removeItem('axon_age');
    localStorage.removeItem('axon_gender');
    
    setToken('');
    setUsername('');
    setRoles([]);
    setProfile({ name: '', dob: '', age: '', gender: '' });
  };

  const isAdmin = roles.includes('ROLE_ADMIN');
  const defaultRoute = isAdmin ? '/keys' : '/sandbox';

  return (
    <BrowserRouter>
      <div style={styles.appContainer}>
        <Routes>
          {token ? (
            <>
              {/* Authenticated Routes */}
              <Route 
                element={
                  <DashboardLayout 
                    token={token} 
                    username={username} 
                    roles={roles} 
                    profile={profile} 
                    onLogout={handleLogout} 
                  />
                }
              >
                <Route path="/keys" element={isAdmin ? <KeysPage /> : <Navigate to="/sandbox" replace />} />
                <Route path="/models" element={isAdmin ? <ModelsPage /> : <Navigate to="/sandbox" replace />} />
                <Route path="/mappings" element={isAdmin ? <MappingsPage /> : <Navigate to="/sandbox" replace />} />
                <Route path="/analytics" element={isAdmin ? <AnalyticsPage /> : <Navigate to="/sandbox" replace />} />
                <Route path="/logs" element={isAdmin ? <LogsPage /> : <Navigate to="/sandbox" replace />} />
                <Route path="/sandbox" element={<SandboxPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/" element={<Navigate to={defaultRoute} replace />} />
                <Route path="*" element={<Navigate to={defaultRoute} replace />} />
              </Route>
            </>
          ) : (
            <>
              {/* Unauthenticated Routes */}
              <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '#0a0a14',
    color: '#f8fafc',
    margin: 0,
    padding: 0,
    width: '100vw',
    overflowX: 'hidden',
  },
};

