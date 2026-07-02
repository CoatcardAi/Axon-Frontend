import React, { useState } from 'react';
import { Lock, RefreshCw, Key, ShieldCheck, Mail } from 'lucide-react';

export default function ProfileTab({ username, roles, styles }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      setSuccess('');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      setSuccess('');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('axon_token');
      const response = await fetch(`${baseUrl}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          oldPassword,
          newPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password.');
      }

      setSuccess('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }} className="animate-fade-in">
      <div style={styles.tabHeader}>
        <div>
          <h2 style={styles.tabTitle}>Profile & Credentials Settings</h2>
          <p style={styles.tabSubtitle}>Manage your account details and update your password.</p>
        </div>
      </div>

      <div className="glass-container" style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ ...styles.formTitle, marginBottom: '4px' }}>Account Information</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.15)', padding: '12px 16px', borderRadius: '8px' }}>
          <Mail size={18} color="#a855f7" />
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Email Address</span>
            <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: '500' }}>{username}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.15)', padding: '12px 16px', borderRadius: '8px' }}>
          <ShieldCheck size={18} color="#10b981" />
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Access Permissions</span>
            <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: '500' }}>{roles.map(r => r.replace('ROLE_', '')).join(', ')}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-container" style={{ padding: '24px' }}>
        <h3 style={{ ...styles.formTitle, marginBottom: '16px' }}>Update Password</h3>

        {error && (
          <div style={{ ...styles.errorAlert, marginBottom: '16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ ...styles.infoAlert, marginBottom: '16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
            <span>{success}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Current Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                className="input-field"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                disabled={loading}
                style={styles.inputPadding}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                className="input-field"
                placeholder="Enter new password (min 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                style={styles.inputPadding}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                className="input-field"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                style={styles.inputPadding}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ ...styles.submitBtn, alignSelf: 'flex-start', marginTop: '8px' }} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw size={16} className="spin" style={styles.spinIcon} />
                Updating...
              </>
            ) : (
              <>
                Change Password
                <Key size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
