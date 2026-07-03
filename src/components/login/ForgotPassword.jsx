import React, { useState } from 'react';
import { KeyRound, Lock, RefreshCw, ShieldCheck } from 'lucide-react';

export default function ForgotPassword({
  username,
  loading,
  handleResetSubmit,
  resetForm,
  styles,
}) {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    handleResetSubmit(otp, newPassword);
  };

  return (
    <form onSubmit={onSubmit} style={styles.form}>
      <div style={styles.otpHeader}>
        <p style={styles.otpInstructions}>
          Resetting password for <strong>{username}</strong>. Enter the OTP code sent to your email.
        </p>
      </div>

      {error && (
        <div style={{ ...styles.errorAlert, marginBottom: '10px' }}>
          <span>{error}</span>
        </div>
      )}

      <div style={styles.inputGroup}>
        <label style={styles.label}>Verification Code</label>
        <div style={styles.inputWrapper}>
          <KeyRound size={18} style={styles.inputIcon} />
          <input
            type="text"
            className="input-field"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
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
            placeholder="Min 8 characters"
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

      <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading}>
        {loading ? (
          <>
            <RefreshCw size={16} className="spin" style={styles.spinIcon} />
            Resetting...
          </>
        ) : (
          <>
            Reset Password
            <ShieldCheck size={16} />
          </>
        )}
      </button>

      <button
        type="button"
        className="btn btn-secondary"
        style={styles.backBtn}
        onClick={resetForm}
        disabled={loading}
      >
        Back to Login
      </button>
    </form>
  );
}
