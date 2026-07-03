import React from 'react';
import { RefreshCw, LogOut, ShieldAlert, Activity, Menu } from 'lucide-react';

export default function Header({
  username,
  roles,
  isAdmin,
  loading,
  loadData,
  onLogout,
  healthData,
  isSidebarOpen,
  toggleSidebar,
  styles,
}) {
  return (
    <header className="glass-container" style={styles.header}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={toggleSidebar}
          className="btn btn-secondary"
          style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}
          title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 style={styles.headerTitle} className="glow-text">
            {isAdmin ? 'Axon Core Gateway' : 'Axon DevPortal'}
          </h1>
        <div style={styles.headerSubtitle}>
          Signed in as <strong>{username}</strong>{' '}
          <span
            style={{
              ...styles.roleTag,
              background: isAdmin ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              borderColor: isAdmin ? 'rgba(168, 85, 247, 0.25)' : 'rgba(59, 130, 246, 0.25)',
              color: isAdmin ? '#d8b4fe' : '#93c5fd',
            }}
          >
            {roles[0]?.replace('ROLE_', '')}
          </span>
        </div>
      </div>
      </div>

      <div style={styles.headerActions}>
        {/* System Health Summary */}
        {healthData && (
          <div style={{ ...styles.healthMiniBadge, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {healthData.status === 'UP' ? (
              <Activity size={14} color="#10b981" />
            ) : (
              <ShieldAlert size={14} color="#ef4444" />
            )}
            <span style={{ fontSize: '0.78rem', fontWeight: '500', color: healthData.status === 'UP' ? '#34d399' : '#f87171' }}>
              System: {healthData.status}
            </span>
          </div>
        )}

        <button onClick={loadData} className="btn btn-secondary" style={styles.iconBtn} title="Force Refresh Data">
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
        </button>

        <button onClick={onLogout} className="btn btn-danger" style={styles.logoutBtn}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
