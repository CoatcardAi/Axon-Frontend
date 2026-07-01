import React, { useState } from 'react';
import { Lock, User, KeyRound, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [step, setStep] = useState('email');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to proceed.');
      }

      if (data.status === 'SIGNUP_REQUIRED') {
        setStep('signup');
        setMessage(data.message || 'No account found. Please sign up.');
      } else if (data.status === 'OTP_REQUIRED') {
        setStep('otp');
        setMessage(data.message || 'OTP sent to your email.');
      } else {
        throw new Error('Unexpected server response.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setLoading(false);
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to register.');
      }

      if (data.status === 'OTP_REQUIRED') {
        setStep('otp');
        setMessage(data.message || 'OTP sent to your email.');
      } else {
        throw new Error('Unexpected server response.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP code.');
      }

      onLoginSuccess(data.token, data.username, data.roles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('email');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setMessage('');
    setError('');
  };

  return (
    <div style={styles.container}>
      <div className="glass-container animate-fade-in" style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <ShieldCheck size={28} color="#a855f7" />
          </div>
          <h2 style={styles.title} className="glow-text">AXON PORTAL</h2>
          <p style={styles.subtitle}>AI Router & Scheduler Core</p>
        </div>
        
        {error && (
          <div style={styles.errorAlert}>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={styles.infoAlert}>
            <span>{message}</span>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} style={styles.form}>
            <div style={styles.formTip}>
              Enter your email address. We will check your account and send an OTP to continue.
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
            
            <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" style={styles.spinIcon} />
                  Sending...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : step === 'signup' ? (
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

            <button type="button" className="btn btn-secondary" style={styles.backBtn} onClick={resetForm} disabled={loading}>
              Back to Email
            </button>
          </form>
        ) : (
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
            
            <button type="button" className="btn btn-secondary" style={styles.backBtn} onClick={resetForm} disabled={loading}>
              Back to Email
            </button>
          </form>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '35px 30px',
    textAlign: 'center',
  },
  logoContainer: {
    marginBottom: '30px',
  },
  logoIcon: {
    display: 'inline-flex',
    padding: '12px',
    borderRadius: '12px',
    background: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.15)',
    marginBottom: '14px',
  },
  title: {
    fontSize: '1.45rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    color: '#fff',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#94a3b8',
  },
  formTip: {
    color: '#c4b5fd',
    fontSize: '0.85rem',
    lineHeight: '1.4',
    marginBottom: '12px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#64748b',
    pointerEvents: 'none',
  },
  inputPadding: {
    paddingLeft: '42px',
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '5px',
  },
  spinIcon: {
    marginRight: '8px',
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#f87171',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    textAlign: 'left',
    marginBottom: '20px',
  },
  infoAlert: {
    background: 'rgba(59, 130, 246, 0.08)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    color: '#bfdbfe',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    textAlign: 'left',
    marginBottom: '20px',
  },
  otpHeader: {
    marginBottom: '5px',
  },
  otpInstructions: {
    fontSize: '0.88rem',
    color: '#94a3b8',
    lineHeight: '1.4',
  },
  testingBanner: {
    marginTop: '12px',
    background: 'rgba(168, 85, 247, 0.06)',
    border: '1px dashed rgba(168, 85, 247, 0.3)',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '0.82rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testingText: {
    color: '#d8b4fe',
  },
  autofillLink: {
    background: 'rgba(168, 85, 247, 0.15)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    color: '#e9d5ff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'Outfit',
    fontWeight: '500',
  },
  backBtn: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '5px',
  }
};
