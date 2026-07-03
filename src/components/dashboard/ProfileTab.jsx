import React, { useState } from 'react';
import { Lock, RefreshCw, Key, ShieldCheck, Mail, User, Calendar } from 'lucide-react';

export default function ProfileTab({ username, roles, profile, styles }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const localStyles = {
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    label: {
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      color: '#94a3b8',
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
    inputIcon: {
      position: 'absolute',
      left: '14px',
      color: '#475569',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
    },
    inputPadding: {
      paddingLeft: '42px',
      width: '100%',
    },
    submitBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
    }
  };

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
        throw new Error(data.message || 'Failed to update password.');
      }

      setSuccess('Password updated successfully.');
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
    <div style={{ width: '100%', textAlign: 'left' }} className="animate-fade-in">
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

        {profile?.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.15)', padding: '12px 16px', borderRadius: '8px' }}>
            <User size={18} color="#60a5fa" />
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Full Name</span>
              <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: '500' }}>{profile.name}</div>
            </div>
          </div>
        )}

        {profile?.dob && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.15)', padding: '12px 16px', borderRadius: '8px' }}>
            <Calendar size={18} color="#34d399" />
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Date of Birth</span>
              <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: '500' }}>{profile.dob}</div>
            </div>
          </div>
        )}

        {profile?.age && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.15)', padding: '12px 16px', borderRadius: '8px' }}>
            <Calendar size={18} color="#f59e0b" />
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Age</span>
              <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: '500' }}>{profile.age} years old</div>
            </div>
          </div>
        )}

        {profile?.gender && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.15)', padding: '12px 16px', borderRadius: '8px' }}>
            <User size={18} color="#f472b6" />
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Gender</span>
              <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: '500' }}>{profile.gender}</div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="glass-container" style={{ padding: '24px' }}>
        <h3 style={{ ...styles.formTitle, marginBottom: '16px' }}>Update Password</h3>

        {error && (
          <div style={{ marginBottom: '16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ marginBottom: '16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
            <span>{success}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={localStyles.inputGroup}>
            <label style={localStyles.label}>Current Password</label>
            <div style={localStyles.inputWrapper}>
              <Lock size={18} style={localStyles.inputIcon} />
              <input
                type="password"
                className="input-field"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                disabled={loading}
                style={localStyles.inputPadding}
              />
            </div>
          </div>

          <div style={localStyles.inputGroup}>
            <label style={localStyles.label}>New Password</label>
            <div style={localStyles.inputWrapper}>
              <Lock size={18} style={localStyles.inputIcon} />
              <input
                type="password"
                className="input-field"
                placeholder="Enter new password (min 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                style={localStyles.inputPadding}
              />
            </div>
          </div>

          <div style={localStyles.inputGroup}>
            <label style={localStyles.label}>Confirm New Password</label>
            <div style={localStyles.inputWrapper}>
              <Lock size={18} style={localStyles.inputIcon} />
              <input
                type="password"
                className="input-field"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                style={localStyles.inputPadding}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ ...localStyles.submitBtn, alignSelf: 'flex-start', marginTop: '8px' }} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw size={16} className="spin" style={{ marginRight: '8px' }} />
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
