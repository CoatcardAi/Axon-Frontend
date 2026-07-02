import React from 'react';
import { User, RefreshCw, ArrowRight } from 'lucide-react';

export default function LoginCard({ username, setUsername, loading, handleEmailSubmit, styles }) {
  return (
    <form onSubmit={handleEmailSubmit} style={styles.form}>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Email / Username</label>
        <div style={styles.inputWrapper}>
          <User size={18} style={styles.inputIcon} />
          <input
            type="email"
            className="input-field"
            placeholder="name@company.com"
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
            Checking Account...
          </>
        ) : (
          <>
            Continue
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
