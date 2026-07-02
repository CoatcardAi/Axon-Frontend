import React from 'react';
import { Database } from 'lucide-react';

export default function AnalyticsTab({ logsList, styles }) {
  return (
    <div>
      <div style={styles.tabHeader}>
        <div>
          <h2 style={styles.tabTitle}>Routing Analytics</h2>
          <p style={styles.tabSubtitle}>
            Live traffic distribution, API usage breakdown and failover load balancing.
          </p>
        </div>
      </div>

      {logsList.length > 0 ? (
        <div style={styles.chartGrid}>
          {/* Card 1: Requests by Model */}
          <div className="glass-container" style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Requests by Model</h3>
            <div style={styles.barList}>
              {(() => {
                const counts = {};
                logsList.forEach((l) => {
                  if (l.status === 'SUCCESS') {
                    counts[l.model] = (counts[l.model] || 0) + 1;
                  }
                });
                const total = Object.values(counts).reduce((acc, c) => acc + c, 0) || 1;
                return Object.entries(counts).map(([modelName, count]) => {
                  const widthPct = (count / total) * 100;
                  return (
                    <div key={modelName} style={styles.barRow}>
                      <div style={styles.barLabel}>
                        <span
                          style={{
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            maxWidth: '180px',
                          }}
                        >
                          {modelName}
                        </span>
                        <strong>{count} reqs</strong>
                      </div>
                      <div style={styles.barOuter}>
                        <div
                          style={{
                            ...styles.barInner,
                            width: `${widthPct}%`,
                            background: 'linear-gradient(90deg, #3b82f6 0%, #00f2fe 100%)',
                          }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Card 2: API Key Load Sharing */}
          <div className="glass-container" style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Load Sharing by API Key</h3>
            <div style={styles.barList}>
              {(() => {
                const counts = {};
                logsList.forEach((l) => {
                  if (l.status === 'SUCCESS' && l.keyName) {
                    counts[l.keyName] = (counts[l.keyName] || 0) + 1;
                  }
                });
                const total = Object.values(counts).reduce((acc, c) => acc + c, 0) || 1;
                return Object.entries(counts).map(([keyName, count]) => {
                  const widthPct = (count / total) * 100;
                  return (
                    <div key={keyName} style={styles.barRow}>
                      <div style={styles.barLabel}>
                        <span>{keyName}</span>
                        <strong>{count} reqs</strong>
                      </div>
                      <div style={styles.barOuter}>
                        <div
                          style={{
                            ...styles.barInner,
                            width: `${widthPct}%`,
                            background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)',
                          }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
          <Database size={40} style={{ marginBottom: '10px' }} />
          <p>No usage data available to generate analytics. Send some messages to the Gemini Chatbot first.</p>
        </div>
      )}
    </div>
  );
}
