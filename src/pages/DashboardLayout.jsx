import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/dashboard/Header';
import Sidebar from '../components/dashboard/Sidebar';
import { styles } from '../styles';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function DashboardLayout({ token, username, roles, profile, onLogout }) {
  const isAdmin = roles.includes('ROLE_ADMIN');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Helper to trigger alert (can be passed via Outlet context)
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const triggerAlert = useCallback((type, msg) => {
    if (type === 'error') {
      setError(msg);
      setTimeout(() => setError(''), 5000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 4000);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/health`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response && response.status === 401) {
        onLogout();
        return;
      }
      if (response && response.ok) {
        const data = await response.json();
        setHealthData(data);
      }
    } catch (err) {
      console.error("Error fetching health data", err);
    }
  }, [token, onLogout]);

  const loadData = useCallback(() => {
    setLoading(true);
    fetchHealth().finally(() => {
      setLoading(false);
      // Increment refresh trigger to tell children routes to reload
      setRefreshTrigger(prev => prev + 1);
    });
  }, [fetchHealth]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return (
    <div style={styles.dashboardContainer} className="animate-fade-in">
      {/* Alert Notices */}
      {error && (
        <div style={styles.floatingAlertError} className="animate-fade-in">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div style={styles.floatingAlertSuccess} className="animate-fade-in">
          <span>{success}</span>
        </div>
      )}

      {/* Top Header Panel */}
      <Header
        username={username}
        roles={roles}
        isAdmin={isAdmin}
        loading={loading}
        loadData={loadData}
        onLogout={onLogout}
        healthData={healthData}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        styles={styles}
      />

      {/* Content Layout */}
      <div 
        className="tab-content-layout" 
        style={{ 
          gridTemplateColumns: isSidebarOpen ? '260px 1fr' : '1fr', 
          gap: isSidebarOpen ? '24px' : '0px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Navigation Sidebar */}
        {isSidebarOpen && (
          <Sidebar isAdmin={isAdmin} styles={styles} />
        )}

        {/* Main Content Area */}
        <main className="glass-container animate-fade-in" style={styles.mainPanel}>
          <Outlet context={{ token, isAdmin, BASE_URL, triggerAlert, refreshTrigger, healthData, profile, username, roles }} />
        </main>
      </div>
    </div>
  );
}
