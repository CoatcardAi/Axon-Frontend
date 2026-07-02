import React, { useState } from 'react';
import { ShieldCheck, Cpu, Zap, Activity, Check } from 'lucide-react';
import LoginCard from './login/LoginCard';
import SignupForm from './login/SignupForm';
import OtpVerification from './login/OtpVerification';
import PasswordLogin from './login/PasswordLogin';
import ForgotPassword from './login/ForgotPassword';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  // Steps: 'email', 'login-password', 'signup', 'otp' (register verification), 'forgot-otp'
  const [step, setStep] = useState('email');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      setError('Please enter a valid email address.');
      return;
    }

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
        setMessage('No account found with this email. Create a new account.');
      } else if (data.status === 'PASSWORD_REQUIRED' || data.status === 'OTP_REQUIRED') {
        // User exists! Transition to password login directly
        setStep('login-password');
      } else {
        throw new Error('Unexpected response from auth service.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/login-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      onLoginSuccess(data.token, data.username, data.roles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be 8+ characters long, contain uppercase, lowercase, numbers, and special characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password, 
          age: age ? parseInt(age) : null, 
          gender: gender || null 
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to register.');
      }

      setStep('otp');
      setMessage(data.message || 'OTP verification sent to your email.');
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

  const triggerForgotPassword = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to dispatch forgot password request.');
      }

      setStep('forgot-otp');
      setMessage('A reset OTP verification code has been dispatched.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (submittedOtp, newPasswordVal) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp: submittedOtp, newPassword: newPasswordVal })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Reset password failed.');
      }

      setStep('login-password');
      setPassword('');
      setMessage('Password reset successfully. You can now login.');
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
    setAge('');
    setGender('');
    setMessage('');
    setError('');
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.gridContainer}>
        
        {/* Left Side Content Column (Branding & Features) */}
        <div style={styles.contentColumn} className="animate-fade-in">
          <div style={styles.brandGroup}>
            <div className="pulse-logo-glow" style={styles.logoBadge}>
              <ShieldCheck size={36} color="#a855f7" />
            </div>
            <div>
              <h1 style={styles.brandTitle}>AXON CORE</h1>
              <p style={styles.brandTagline}>AI Router & Scheduler Core</p>
            </div>
          </div>

          <div style={styles.featuresList}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}><Cpu size={18} /></div>
              <div>
                <h4 style={styles.featureTitle}>Intelligent Model Routing</h4>
                <p style={styles.featureText}>Automatically balances calls across Gemini model tiers based on prompt intent and request size.</p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}><Zap size={18} /></div>
              <div>
                <h4 style={styles.featureTitle}>Graceful Fallback & Failovers</h4>
                <p style={styles.featureText}>Redirects traffic to alternative active keys seamlessly when encountering 429 rate limit statuses.</p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}><Activity size={18} /></div>
              <div>
                <h4 style={styles.featureTitle}>Diagnostic Timeline Logs</h4>
                <p style={styles.featureText}>Gain deep insight into gateway scheduling logic and latency statistics via interactive tracers.</p>
              </div>
            </div>
          </div>

          <div style={styles.footerCopy}>
            &copy; 2026 Axon Intelligent Systems. All rights secured.
          </div>
        </div>

        {/* Right Side Login Card Column */}
        <div style={styles.cardColumn}>
          <div className="glass-container animate-fade-in" style={styles.card}>
            <div style={styles.logoHeader}>
              <h2 style={styles.cardTitle} className="glow-text">
                {step === 'email' && 'Welcome Back'}
                {step === 'login-password' && 'Enter Password'}
                {step === 'signup' && 'Create Account'}
                {step === 'otp' && 'OTP Verification'}
                {step === 'forgot-otp' && 'Reset Password'}
              </h2>
              <p style={styles.cardSubtitle}>
                {step === 'email' && 'Enter your email credentials to access your API pool.'}
                {step === 'login-password' && 'Input password credentials linked to this email.'}
                {step === 'signup' && 'Configure security keys for your router workspace.'}
                {step === 'otp' && 'Confirm OTP security key delivered via email.'}
                {step === 'forgot-otp' && 'Verify OTP code and configure a new password.'}
              </p>
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

            {step === 'email' && (
              <LoginCard
                username={username}
                setUsername={setUsername}
                loading={loading}
                handleEmailSubmit={handleEmailSubmit}
                styles={styles}
              />
            )}

            {step === 'login-password' && (
              <PasswordLogin
                username={username}
                password={password}
                setPassword={setPassword}
                loading={loading}
                handlePasswordLoginSubmit={handlePasswordLoginSubmit}
                triggerForgotPassword={triggerForgotPassword}
                resetForm={resetForm}
                styles={styles}
              />
            )}

            {step === 'signup' && (
              <SignupForm
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                age={age}
                setAge={setAge}
                gender={gender}
                setGender={setGender}
                loading={loading}
                handleSignupSubmit={handleSignupSubmit}
                resetForm={resetForm}
                styles={styles}
              />
            )}

            {step === 'otp' && (
              <OtpVerification
                username={username}
                otp={otp}
                setOtp={setOtp}
                loading={loading}
                handleOtpSubmit={handleOtpSubmit}
                resetForm={resetForm}
                styles={styles}
              />
            )}

            {step === 'forgot-otp' && (
              <ForgotPassword
                username={username}
                loading={loading}
                handleResetSubmit={handleResetSubmit}
                resetForm={resetForm}
                styles={styles}
              />
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '24px',
    background: '#040408',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    width: '100%',
    maxWidth: '1050px',
    background: 'rgba(14, 14, 24, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
  },
  contentColumn: {
    padding: '50px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'linear-gradient(145deg, #090912 0%, #121020 100%)',
    borderRight: '1px solid rgba(255, 255, 255, 0.04)',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logoBadge: {
    padding: '12px',
    background: 'rgba(168, 85, 247, 0.06)',
    border: '1px solid rgba(168, 85, 247, 0.15)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '0.05em',
    fontFamily: 'Outfit',
  },
  brandTagline: {
    fontSize: '0.85rem',
    color: '#a855f7',
    fontWeight: '600',
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    margin: '40px 0',
  },
  featureItem: {
    display: 'flex',
    gap: '16px',
  },
  featureIcon: {
    flexShrink: 0,
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#a855f7',
  },
  featureTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
    fontFamily: 'Outfit',
  },
  featureText: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    lineHeight: '1.5',
  },
  footerCopy: {
    fontSize: '0.72rem',
    color: '#475569',
  },
  cardColumn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    padding: '30px 24px',
    background: 'rgba(18, 18, 30, 0.45)',
    borderRadius: '18px',
  },
  logoHeader: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: '1.45rem',
    fontWeight: '700',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    marginTop: '6px',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
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
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#475569',
    pointerEvents: 'none',
  },
  inputPadding: {
    paddingLeft: '42px',
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '6px',
  },
  backBtn: {
    width: '100%',
    justifyContent: 'center',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  spinIcon: {
    marginRight: '8px',
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    textAlign: 'left',
    lineHeight: '1.4',
  },
  infoAlert: {
    background: 'rgba(59, 130, 246, 0.06)',
    border: '1px solid rgba(59, 130, 246, 0.18)',
    color: '#bfdbfe',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    textAlign: 'left',
    lineHeight: '1.4',
  },
  otpHeader: {
    marginBottom: '4px',
  },
  otpInstructions: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    lineHeight: '1.45',
  },
  formTip: {
    color: '#c4b5fd',
    fontSize: '0.8rem',
    lineHeight: '1.4',
    marginBottom: '4px',
  }
};
