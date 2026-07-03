import React from 'react';
import { Lock, RefreshCw, LogIn, ArrowLeft } from 'lucide-react';

export default function PasswordLogin({
  password,
  setPassword,
  loading,
  handlePasswordLoginSubmit,
  triggerForgotPassword,
  resetForm,
  styles,
}) {
  return (
    <form onSubmit={handlePasswordLoginSubmit} style={styles.form}>
      <div style={styles.inputGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={styles.label}>Password</label>
          <button
            type="button"
            onClick={triggerForgotPassword}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a855f7',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            Forgot Password?
          </button>
        </div>
        <div style={styles.inputWrapper}>
          <Lock size={18} style={styles.inputIcon} />
          <input
            type="password"
            className="input-field"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Logging In...
          </>
        ) : (
          <>
            Log In
            <LogIn size={16} />
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
        <ArrowLeft size={14} />
        Back to Email
      </button>
    </form>
  );
}
