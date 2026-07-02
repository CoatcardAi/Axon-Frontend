import React from 'react';
import { KeyRound, RefreshCw, ShieldCheck } from 'lucide-react';

export default function OtpVerification({
  username,
  otp,
  setOtp,
  loading,
  handleOtpSubmit,
  resetForm,
  styles,
}) {
  return (
    <form onSubmit={handleOtpSubmit} style={styles.form}>
      <div style={styles.otpHeader}>
        <p style={styles.otpInstructions}>
          Enter the verification code sent to <strong>{username}</strong>.
        </p>
      </div>

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

      <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading}>
        {loading ? (
          <>
            <RefreshCw size={16} className="spin" style={styles.spinIcon} />
            Verifying...
          </>
        ) : (
          <>
            Verify & Log In
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
        Back to Email
      </button>
    </form>
  );
}
