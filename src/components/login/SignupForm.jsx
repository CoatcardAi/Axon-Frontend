import React from 'react';
import { User, Lock, RefreshCw, ArrowRight } from 'lucide-react';

export default function SignupForm({
  username,
  setUsername,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  handleSignupSubmit,
  resetForm,
  styles,
}) {
  return (
    <form onSubmit={handleSignupSubmit} style={styles.form}>
      <div style={styles.formTip}>
        Create a new account. We will send an OTP to verify your email before saving your details.
      </div>
      
      <div style={styles.inputGroup}>
        <label style={styles.label}>Email</label>
        <div style={styles.inputWrapper}>
          <User size={18} style={styles.inputIcon} />
          <input
            type="email"
            className="input-field"
            placeholder="Enter your email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            style={styles.inputPadding}
          />
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Password</label>
        <div style={styles.inputWrapper}>
          <Lock size={18} style={styles.inputIcon} />
          <input
            type="password"
            className="input-field"
            placeholder="Choose a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={styles.inputPadding}
          />
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Confirm Password</label>
        <div style={styles.inputWrapper}>
          <Lock size={18} style={styles.inputIcon} />
          <input
            type="password"
            className="input-field"
            placeholder="Confirm your password"
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
            Registering...
          </>
        ) : (
          <>
            Sign Up
            <ArrowRight size={16} />
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
        Back to Email
      </button>
    </form>
  );
}
