import React, { useState } from 'react';
import { X, Check, Copy, FileText } from 'lucide-react';

export default function LogsTab({ logsList, handleCopyToClipboard, copiedId, styles }) {
  const [selectedLog, setSelectedLog] = useState(null);

  const getRelatedAttempts = (log) => {
    if (!log) return [];
    const logTime = new Date(log.timestamp).getTime();
    return logsList
      .filter(
        (l) =>
          l.id !== log.id &&
          l.model === log.model &&
          l.provider === log.provider &&
          Math.abs(new Date(l.timestamp).getTime() - logTime) < 10000
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  return (
    <div>
      <div style={styles.tabHeader}>
        <div>
          <h2 style={styles.tabTitle}>Gateway Execution Logs</h2>
          <p style={styles.tabSubtitle}>Inspect real-time routing parameters, token tracking, and latency.</p>
        </div>
      </div>

      {logsList.length === 0 ? (
        <div className="glass-container" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No execution logs recorded yet. Run chatbot queries to generate log entries.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Timestamp</th>
                <th style={styles.th}>API Key Name</th>
                <th style={styles.th}>Model Used</th>
                <th style={styles.th}>Result</th>
                <th style={styles.th}>Latency (ms)</th>
                <th style={styles.th}>Tokens Used</th>
                <th style={styles.th}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {logsList.map((log) => (
                <tr key={log.id} style={styles.tr}>
                  <td style={styles.td}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{log.keyName || 'Unknown Key'}</div>
                    <code style={{ fontSize: '0.68rem', color: '#64748b' }}>{log.keyId}</code>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.logModel}>{log.model}</span>
                  </td>
                  <td style={styles.td}>
                    <span className={`badge ${log.status === 'SUCCESS' ? 'badge-active' : 'badge-inactive'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <strong>{log.latencyMs} ms</strong>
                  </td>
                  <td style={styles.td}>
                    <div>{log.promptTokens + log.completionTokens}</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {log.promptTokens} p + {log.completionTokens} c
                    </div>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Drawer (Logs inspection) */}
      {selectedLog && (
        <div className="drawer-overlay" onClick={() => setSelectedLog(null)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                paddingBottom: '12px',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Execution Diagnostic Detail</h3>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedLog(null)}
                style={{ padding: '6px 8px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={styles.metaResponseGrid}>
                <div>
                  <span style={styles.metaLabel}>Timestamp</span>
                  <div style={styles.metaVal}>{new Date(selectedLog.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <span style={styles.metaLabel}>Status</span>
                  <div style={{ marginTop: '4px' }}>
                    <span
                      className={`badge ${selectedLog.status === 'SUCCESS' ? 'badge-active' : 'badge-inactive'}`}
                    >
                      {selectedLog.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={styles.metaLabel}>API Key Used</span>
                  <div style={styles.metaVal}>{selectedLog.keyName || 'Unknown Key'}</div>
                  <code style={{ fontSize: '0.68rem', color: '#64748b' }}>{selectedLog.keyId}</code>
                </div>
                <div>
                  <span style={styles.metaLabel}>Model / Provider</span>
                  <div style={styles.metaVal}>{selectedLog.model}</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Gemini</div>
                </div>
                <div>
                  <span style={styles.metaLabel}>Latency</span>
                  <div style={{ ...styles.metaVal, color: '#10b981' }}>{selectedLog.latencyMs} ms</div>
                </div>
                <div>
                  <span style={styles.metaLabel}>Tokens Logged</span>
                  <div style={styles.metaVal}>{selectedLog.promptTokens + selectedLog.completionTokens}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {selectedLog.promptTokens} prompt / {selectedLog.completionTokens} completion
                  </div>
                </div>
              </div>

              {selectedLog.routingTimeline && selectedLog.routingTimeline.length > 0 && (
                <div>
                  <span style={styles.responseTextTitle}>Gateway Routing Step Log:</span>
                  <div style={{ ...styles.timelineBox, marginTop: '8px', background: 'rgba(0,0,0,0.15)' }}>
                    <div className="timeline">
                      {selectedLog.routingTimeline.map((step, idx) => {
                        const isSuccess = step.includes('successfully') || step.includes('Selection');
                        const isFail = step.includes('failed') || step.includes('Exhausted') || step.includes('Failover');
                        let type = 'normal';
                        if (isSuccess) type = 'success';
                        else if (isFail) type = 'error';

                        return (
                          <div
                            key={idx}
                            className={`timeline-item ${
                              type === 'success' ? 'success' : type === 'error' ? 'error' : ''
                            }`}
                          >
                            <div className="timeline-badge">{idx + 1}</div>
                            <div style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                              {step}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div style={styles.responseTextBlock}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={styles.responseTextTitle}>Input Prompt:</span>
                </div>
                <pre style={{ ...styles.responseTextPre, maxHeight: '80px' }}>
                  {selectedLog.prompt || 'No prompt content recorded.'}
                </pre>
              </div>

              <div style={styles.responseTextBlock}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={styles.responseTextTitle}>Response Output / Error Message:</span>
                  <button
                    onClick={() =>
                      handleCopyToClipboard(
                        selectedLog.status === 'SUCCESS' ? selectedLog.responseText : selectedLog.errorMessage,
                        `log-resp-${selectedLog.id}`
                      )
                    }
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#64748b',
                      fontSize: '0.75rem',
                    }}
                  >
                    {copiedId === `log-resp-${selectedLog.id}` ? (
                      <Check size={12} color="#10b981" />
                    ) : (
                      <Copy size={12} />
                    )}
                    {copiedId === `log-resp-${selectedLog.id}` ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre
                  style={{
                    ...styles.responseTextPre,
                    maxHeight: '160px',
                    borderColor:
                      selectedLog.status === 'SUCCESS' ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.2)',
                  }}
                >
                  {selectedLog.status === 'SUCCESS' ? selectedLog.responseText : `Error: ${selectedLog.errorMessage}`}
                </pre>
              </div>

              {getRelatedAttempts(selectedLog).length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <span style={styles.responseTextTitle}>Failover Retry & Key Switching Sequence:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {getRelatedAttempts(selectedLog).map((attempt, idx) => (
                      <div
                        key={attempt.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'rgba(0,0,0,0.15)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.06)',
                          fontSize: '0.8rem',
                        }}
                      >
                        <span>
                          Attempt {idx + 1}: <strong>{attempt.keyName}</strong>
                        </span>
                        <span
                          className={`badge ${attempt.status === 'SUCCESS' ? 'badge-active' : 'badge-inactive'}`}
                          style={{ padding: '2px 8px', fontSize: '0.68rem' }}
                        >
                          {attempt.status}
                        </span>
                      </div>
                    ))}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(0,0,0,0.15)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        fontSize: '0.8rem',
                      }}
                    >
                      <span>
                        Final Selection: <strong>{selectedLog.keyName}</strong>
                      </span>
                      <span
                        className={`badge ${selectedLog.status === 'SUCCESS' ? 'badge-active' : 'badge-inactive'}`}
                        style={{ padding: '2px 8px', fontSize: '0.68rem' }}
                      >
                        {selectedLog.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
