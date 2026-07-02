import React from 'react';
import { User, Calendar, RefreshCw, ArrowRight } from 'lucide-react';

export default function SignupForm({
  username,
  setUsername,
  name,
  setName,
  dob,
  setDob,
  gender,
  setGender,
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
        <label style={styles.label}>Full Name</label>
        <div style={styles.inputWrapper}>
          <User size={18} style={styles.inputIcon} />
          <input
            type="text"
            className="input-field"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            style={styles.inputPadding}
          />
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Date of Birth</label>
        <div style={styles.inputWrapper}>
          <Calendar size={18} style={styles.inputIcon} />
          <input
            type="date"
            className="input-field"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            disabled={loading}
            style={styles.inputPadding}
          />
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Gender</label>
        <div style={styles.inputWrapper}>
          <User size={18} style={styles.inputIcon} />
          <select
            className="input-field"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            disabled={loading}
            style={styles.inputPadding}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_say">Prefer not to say</option>
          </select>
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
