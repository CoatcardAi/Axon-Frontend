import React from 'react';
import { Database, Zap, Flame, Clock, Shield } from 'lucide-react';

export default function AnalyticsTab({ logsList, healthData, getSparklinePath, styles }) {
  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div style={styles.tabHeader}>
        <div>
          <h2 style={styles.tabTitle}>Routing Analytics</h2>
          <p style={styles.tabSubtitle}>
            Live traffic distribution, API usage breakdown and failover load balancing.
          </p>
        </div>
      </div>

      {/* System Health Metric Bar - Rendered only here inside Analytics */}
      {healthData && (
        <section style={{ ...styles.metricsBar, marginBottom: '24px' }}>
          <div className="glass-container" style={{ ...styles.metricCard, minWidth: '0' }}>
            <div style={{...styles.metricIconBox, background: 'rgba(16, 185, 129, 0.1)', flexShrink: 0 }}>
              <Zap size={20} color="#10b981" />
            </div>
            <div>
              <div style={{...styles.metricVal, color: '#10b981'}}>{healthData.activeKeys}</div>
              <div style={styles.metricLabel}>Active Keys</div>
            </div>
          </div>

          <div className="glass-container" style={{ ...styles.metricCard, minWidth: '0' }}>
            <div style={{...styles.metricIconBox, background: 'rgba(245, 158, 11, 0.1)', flexShrink: 0 }}>
              <Flame size={20} color="#f59e0b" />
            </div>
            <div>
              <div style={{...styles.metricVal, color: '#f59e0b'}}>{healthData.cooldownKeys}</div>
              <div style={styles.metricLabel}>In Cooldown</div>
            </div>
          </div>

          <div className="glass-container" style={{ ...styles.metricCard, minWidth: '0' }}>
            <div style={{...styles.metricIconBox, background: 'rgba(168, 85, 247, 0.1)', flexShrink: 0 }}>
              <Clock size={20} color="#a855f7" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <span style={styles.metricVal}>
                  {logsList.length > 0 ? `${Math.round(logsList.reduce((acc, l) => acc + l.latencyMs, 0) / logsList.length)}ms` : '0ms'}
                </span>
                {logsList.length > 0 && getSparklinePath && (
                  <svg width="70" height="24" style={{ overflow: 'visible' }}>
                    <path d={getSparklinePath()} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div style={styles.metricLabel}>Avg Latency (Trend)</div>
            </div>
          </div>

          <div className="glass-container" style={{ ...styles.metricCard, minWidth: '0' }}>
            <div style={{...styles.metricIconBox, background: healthData.redisStatus === 'CONNECTED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', flexShrink: 0 }}>
              <Database size={20} color={healthData.redisStatus === 'CONNECTED' ? '#10b981' : '#ef4444'} />
            </div>
            <div style={{ minWidth: '0', overflow: 'hidden' }}>
              <div style={{...styles.metricVal, color: healthData.redisStatus === 'CONNECTED' ? '#10b981' : '#ef4444', fontSize: '1.15rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'}}>
                {healthData.redisStatus || 'UNKNOWN'}
              </div>
              <div style={{ ...styles.metricLabel, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Redis: {healthData.redisCachedPairsCount || 0} cached</div>
            </div>
          </div>

          <div className="glass-container" style={{ ...styles.metricCard, minWidth: '0' }}>
            <div style={{...styles.metricIconBox, background: healthData.mongoSyncStatus === 'SYNCHRONIZED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', flexShrink: 0 }}>
              <Shield size={20} color={healthData.mongoSyncStatus === 'SYNCHRONIZED' ? '#10b981' : '#f59e0b'} />
            </div>
            <div style={{ minWidth: '0', overflow: 'hidden' }}>
              <div style={{...styles.metricVal, color: healthData.mongoSyncStatus === 'SYNCHRONIZED' ? '#10b981' : '#f59e0b', fontSize: '1.15rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'}}>
                {healthData.mongoSyncStatus || 'UNKNOWN'}
              </div>
              <div style={{ ...styles.metricLabel, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Mongo: {healthData.mongoStatus || 'UNKNOWN'}</div>
            </div>
          </div>
        </section>
      )}

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
