import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('axon_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('axon_username') || '');
  const [roles, setRoles] = useState(JSON.parse(localStorage.getItem('axon_roles') || '[]'));

  const handleLoginSuccess = (jwt, user, userRoles) => {
    localStorage.setItem('axon_token', jwt);
    localStorage.setItem('axon_username', user);
    localStorage.setItem('axon_roles', JSON.stringify(userRoles));
    
    setToken(jwt);
    setUsername(user);
    setRoles(userRoles);
  };

  const handleLogout = () => {
    localStorage.removeItem('axon_token');
    localStorage.removeItem('axon_username');
    localStorage.removeItem('axon_roles');
    
    setToken('');
    setUsername('');
    setRoles([]);
  };

  return (
    <div style={styles.appContainer}>
      {token ? (
        <Dashboard 
          token={token} 
          username={username} 
          roles={roles} 
          onLogout={handleLogout} 
        />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px 0',
  }
};
