import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User, Sparkles, Activity, 
  RefreshCw, Check, Copy 
} from 'lucide-react';

export default function SandboxTab({
  chatMessages,
  chatInput,
  setChatInput,
  chatLoading,
  selectedChatMsgId,
  setSelectedChatMsgId,
  sendPromptToChatbot,
  handleChatSubmit,
  handleCopyToClipboard,
  copiedId,
  styles: dashboardStyles
}) {
  const [showInspector, setShowInspector] = useState(true);
  const chatEndRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Find active message routing details
  const activeSelectedMsg = chatMessages.find(m => m.id === selectedChatMsgId);
  const activeRoutingData = activeSelectedMsg ? activeSelectedMsg.routingData : null;

  // Inline bold text formatter
  const parseInlineBold = (text) => {
    const regex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} style={{ color: '#fff', fontWeight: '700' }}>
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  // Simple Markdown Parser (paragraphs, bold, list, code block)
  const parseMarkdown = (text) => {
    if (!text) return null;
    const parts = text.split(/```/g);
    
    return parts.map((part, index) => {
      // Odd index implies a code block
      if (index % 2 === 1) {
        const lines = part.split('\n');
        const firstLine = lines[0].trim();
        const codeLanguage = ['js', 'javascript', 'python', 'py', 'json', 'bash', 'sh', 'curl', 'html', 'css', 'java'].includes(firstLine) ? firstLine : '';
        const codeContent = codeLanguage ? lines.slice(1).join('\n') : part;

        return (
          <div key={index} className="chat-code-block glass-container" style={styles.codeBlockContainer}>
            <div style={styles.codeBlockHeader}>
              <span style={styles.codeBlockLang}>{codeLanguage || 'code'}</span>
              <button
                onClick={() => handleCopyToClipboard(codeContent.trim(), `chat-code-${index}`)}
                className="btn btn-secondary"
                style={styles.codeBlockCopyBtn}
              >
                {copiedId === `chat-code-${index}` ? (
                  <Check size={12} color="#10b981" />
                ) : (
                  <Copy size={12} />
                )}
                {copiedId === `chat-code-${index}` ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre style={styles.codeBlockPre}>
              <code>{codeContent.trim()}</code>
            </pre>
          </div>
        );
      } else {
        // Even index implies markdown text
        const lines = part.split('\n');
        return lines.map((line, lineIdx) => {
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const cleanText = line.trim().replace(/^[-*]\s+/, '');
            return (
              <ul key={lineIdx} style={styles.chatList}>
                <li>{parseInlineBold(cleanText)}</li>
              </ul>
            );
          }
          if (line.trim() === '') return <div key={lineIdx} style={{ height: '8px' }} />;
          return (
            <p key={lineIdx} style={styles.chatParagraph}>
              {parseInlineBold(line)}
            </p>
          );
        });
      }
    });
  };

  const handleSelectMessage = (msg) => {
    if (msg.routingData) {
      setSelectedChatMsgId(msg.id);
      setShowInspector(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', width: '100%' }}>
      {/* Tab Subheader Controls */}
      <div style={styles.subHeader}>
        <div>
          <h2 style={dashboardStyles.tabTitle}>Gemini Auto-Router Chat</h2>
          <p style={dashboardStyles.tabSubtitle}>
            Failover routing testing sandbox. Selected models are dynamically checkout-tested.
          </p>
        </div>
        <button
          onClick={() => setShowInspector(prev => !prev)}
          className="btn btn-secondary"
          style={styles.inspectorToggleBtn}
        >
          <Activity size={15} color={showInspector ? '#a855f7' : '#94a3b8'} />
          <span>{showInspector ? 'Hide Tracer' : 'Open Routing Tracer'}</span>
        </button>
      </div>

      {/* Main Sandbox Workspace */}
      <div style={styles.workspaceLayout}>
        {/* Chat Widget Panel */}
        <div 
          style={{ 
            ...styles.chatPanel, 
            gridColumn: showInspector ? 'span 1' : 'span 2' 
          }}
        >
          {/* Chat Headers */}
          <div style={styles.chatHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={styles.onlineDot} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>
                Active Router Connection
              </span>
            </div>
            <span style={styles.providerTag}>
              Gateway: Google Gemini
            </span>
          </div>

          {/* Chat History View */}
          <div style={styles.chatBody} className="scrollbar-styled">
            {chatMessages.length <= 1 && (
              <div style={styles.welcomeHero}>
                <div style={styles.welcomeBotLogo} className="pulse-logo-glow">
                  <Sparkles size={40} color="#a855f7" />
                </div>
                <h3 className="glow-text" style={styles.welcomeTitle}>Axon Routing Agent</h3>
                <p style={styles.welcomeSubtitle}>
                  Trigger prompts to test auto-routing fallback mechanisms, latency scores, and paid-vs-free pool switches.
                </p>

                <div style={styles.welcomeGrid}>
                  <div style={styles.welcomeCard} onClick={() => sendPromptToChatbot('Hi there! Identify yourself and list your loaded models.')}>
                    <h4 style={styles.welcomeCardTitle}>Identify Model Pool</h4>
                    <p style={styles.welcomeCardText}>Check active models, keys allocations, and load balancer rules.</p>
                  </div>
                  <div style={styles.welcomeCard} onClick={() => sendPromptToChatbot('Write a Python script to sort an array of logs by latency, and explain the complexity.')}>
                    <h4 style={styles.welcomeCardTitle}>Code & Latency sorting</h4>
                    <p style={styles.welcomeCardText}>Generate code segments and inspect performance benchmarks.</p>
                  </div>
                  <div style={styles.welcomeCard} onClick={() => sendPromptToChatbot('Perform routing diagnostics: trigger_rate_limit')}>
                    <h4 style={{...styles.welcomeCardTitle, color: '#f59e0b'}}>Simulate Rate Limit</h4>
                    <p style={styles.welcomeCardText}>Force keys into cooldown to test routing retry fallbacks.</p>
                  </div>
                  <div style={styles.welcomeCard} onClick={() => sendPromptToChatbot('Force routing diagnostic override: trigger_provider_error')}>
                    <h4 style={{...styles.welcomeCardTitle, color: '#ef4444'}}>Simulate Provider Error</h4>
                    <p style={styles.welcomeCardText}>Inject provider failures to inspect failover switching timelines.</p>
                  </div>
                </div>
              </div>
            )}

            {chatMessages.map((msg) => (
              <div key={msg.id} style={styles.msgRow}>
                <div style={styles.msgRowCentered}>
                  <div style={styles.avatarWrapper}>
                    {msg.sender === 'user' ? (
                      <div style={styles.avatarUser}>
                        <User size={14} />
                      </div>
                    ) : (
                      <div style={styles.avatarBot}>
                        <Sparkles size={14} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.8rem', color: msg.sender === 'user' ? '#3b82f6' : '#a855f7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      {msg.sender === 'user' ? 'You' : 'Gemini Auto-Router'}
                    </div>
                    <div
                      style={{
                        ...(msg.sender === 'user' ? styles.bubbleUser : styles.bubbleBot),
                        border:
                          selectedChatMsgId === msg.id
                            ? '1px solid rgba(168, 85, 247, 0.3)'
                            : msg.isError
                            ? '1px solid rgba(239, 68, 68, 0.3)'
                            : 'none',
                        cursor: msg.routingData ? 'pointer' : 'default',
                      }}
                      onClick={() => handleSelectMessage(msg)}
                      title={msg.routingData ? 'Click to view execution sequence logs' : ''}
                    >
                      {msg.sender === 'user' ? (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                      ) : (
                        <div style={styles.markdownWrapper}>{parseMarkdown(msg.text)}</div>
                      )}

                      {msg.routingData && (
                        <div style={styles.msgIndicator}>
                          <Activity size={10} style={{ marginRight: '4px' }} />
                          <span>
                            Routed: {msg.routingData.model} ({msg.routingData.latencyMs}ms) • Click to inspect
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {chatLoading && (
              <div style={styles.msgRow}>
                <div style={styles.msgRowCentered}>
                  <div style={styles.avatarWrapper}>
                    <div style={styles.avatarBot}>
                      <Sparkles size={14} />
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.8rem', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Gemini Auto-Router
                    </div>
                    <div className="loading-dots" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <span className="dot" style={styles.loadingDot} />
                      <span className="dot" style={{ ...styles.loadingDot, animationDelay: '0.2s' }} />
                      <span className="dot" style={{ ...styles.loadingDot, animationDelay: '0.4s' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#475569', marginTop: '6px', display: 'block' }}>
                      Routing and selecting best latency keys...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Centered Pill Chat Input Container */}
          <div style={styles.inputAreaWrapper}>
            <form onSubmit={handleChatSubmit} style={styles.chatInputForm}>
              <input
                type="text"
                className="input-field"
                placeholder="Ask the auto-routing chatbot anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
                style={styles.chatInputField}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={styles.chatSendBtn} 
                disabled={chatLoading || !chatInput.trim()}
              >
                {chatLoading ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
              </button>
            </form>
            <div style={styles.inputDisclaimer}>
              * Sandbox runs real Gemini API keys. Triggers like "trigger_rate_limit" trigger mock overrides for failover tests.
            </div>
          </div>
        </div>

        {/* Sidebar Inspector Panel */}
        {showInspector && (
          <div style={{ width: '340px', minHeight: 0 }}>
            <div className="glass-container" style={styles.chatInspector}>
              <h3 style={styles.inspectorTitle}>
                <Activity size={18} color="#a855f7" />
                <span>Routing & Failover Inspector</span>
              </h3>

              {activeRoutingData ? (
                <div style={styles.inspectorContent} className="animate-fade-in">
                  <div style={styles.inspectorMetaRow}>
                    <div style={styles.inspectorCard}>
                      <span style={styles.inspectorLabel}>Selected Model</span>
                      <div style={styles.inspectorVal}>{activeRoutingData.model}</div>
                    </div>
                    <div style={styles.inspectorCard}>
                      <span style={styles.inspectorLabel}>Latency</span>
                      <div style={{ ...styles.inspectorVal, color: '#34d399' }}>
                        {activeRoutingData.latencyMs} ms
                      </div>
                    </div>
                  </div>

                  <div style={styles.inspectorMetaRow}>
                    <div style={styles.inspectorCard}>
                      <span style={styles.inspectorLabel}>Assigned API Key</span>
                      <div style={{ ...styles.inspectorVal, fontSize: '0.82rem' }}>
                        {activeRoutingData.selectedKeyName}
                      </div>
                      <span style={{ fontSize: '0.62rem', color: '#475569', display: 'block', marginTop: '2px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        {activeRoutingData.selectedKeyId}
                      </span>
                    </div>
                    <div style={styles.inspectorCard}>
                      <span style={styles.inspectorLabel}>Total Tokens</span>
                      <div style={styles.inspectorVal}>
                        {activeRoutingData.promptTokens + activeRoutingData.completionTokens}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                        {activeRoutingData.promptTokens} p / {activeRoutingData.completionTokens} c
                      </span>
                    </div>
                  </div>

                  <div style={styles.inspectorCard}>
                    <span style={styles.inspectorLabel}>Failover Retries</span>
                    <div style={{ marginTop: '4px' }}>
                      <span className="badge badge-active">
                        {activeRoutingData.attempts} {activeRoutingData.attempts === 1 ? 'Attempt' : 'Attempts'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={styles.inspectorSectionTitle}>Execution Pipeline Timeline:</h4>
                    <div style={styles.timelineBox}>
                      <ol style={{ paddingLeft: '14px', margin: 0, fontSize: '0.78rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.4' }}>
                        {activeRoutingData.routingTimeline && activeRoutingData.routingTimeline.map((step, sIdx) => (
                          <li key={sIdx} style={{ paddingLeft: '4px' }}>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.emptyInspector}>
                  <Sparkles size={28} color="#475569" style={{ marginBottom: '12px' }} />
                  <p>No prompt selected.</p>
                  <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>
                    Click on any routed bot response in the sandbox chat to inspect failover hops and latencies.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sandbox tab styling variables
const styles = {
  subHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexShrink: 0,
  },
  inspectorToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
  },
  workspaceLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '20px',
    flex: 1,
    minHeight: 0,
  },
  chatPanel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    background: 'rgba(14, 14, 24, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    boxShadow: 'none',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    background: 'rgba(10, 10, 15, 0.2)',
    borderTopLeftRadius: '15px',
    borderTopRightRadius: '15px',
    flexShrink: 0,
  },
  onlineDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 10px #10b981',
  },
  providerTag: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 8px',
    borderRadius: '99px',
  },
  chatBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
  },
  welcomeHero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto 0',
    padding: '40px 20px',
    textAlign: 'center',
  },
  welcomeBotLogo: {
    padding: '14px',
    borderRadius: '50%',
    background: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    marginBottom: '16px',
  },
  welcomeTitle: {
    fontSize: '1.65rem',
    fontWeight: '700',
    marginBottom: '8px',
    fontFamily: 'Outfit',
  },
  welcomeSubtitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    maxWidth: '480px',
    lineHeight: '1.5',
    marginBottom: '32px',
  },
  welcomeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    maxWidth: '720px',
    width: '100%',
  },
  welcomeCard: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      background: 'rgba(168, 85, 247, 0.04)',
      borderColor: 'rgba(168, 85, 247, 0.15)',
      transform: 'translateY(-1px)',
    }
  },
  welcomeCardTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#a855f7',
    marginBottom: '4px',
    fontFamily: 'Outfit',
  },
  welcomeCardText: {
    fontSize: '0.78rem',
    color: '#64748b',
    lineHeight: '1.4',
  },
  msgRow: {
    width: '100%',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
  },
  msgRowCentered: {
    maxWidth: '820px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    gap: '18px',
  },
  avatarWrapper: {
    flexShrink: 0,
  },
  avatarUser: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#93c5fd',
  },
  avatarBot: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d8b4fe',
  },
  bubbleUser: {
    color: '#f8fafc',
    fontSize: '0.96rem',
    lineHeight: '1.6',
    background: 'transparent',
    padding: 0,
  },
  bubbleBot: {
    color: '#e2e8f0',
    fontSize: '0.96rem',
    lineHeight: '1.65',
    background: 'transparent',
    padding: 0,
  },
  msgTimestamp: {
    fontSize: '0.7rem',
    color: '#64748b',
    marginTop: '4px',
    display: 'block',
    padding: '0 4px',
  },
  msgIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '10px',
    padding: '4px 10px',
    borderRadius: '6px',
    background: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.15)',
    color: '#d8b4fe',
    fontSize: '0.72rem',
    fontWeight: '500',
  },
  markdownWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  chatParagraph: {
    margin: 0,
  },
  chatList: {
    margin: '0 0 0 20px',
    padding: 0,
  },
  codeBlockContainer: {
    marginTop: '10px',
    marginBottom: '10px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  codeBlockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.25)',
    padding: '6px 12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  codeBlockLang: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    color: '#64748b',
    fontFamily: 'monospace',
  },
  codeBlockCopyBtn: {
    padding: '3px 8px',
    fontSize: '0.65rem',
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
  },
  codeBlockPre: {
    margin: 0,
    padding: '12px',
    overflowX: 'auto',
    fontFamily: 'monospace, SFMono-Regular, Consolas',
    fontSize: '0.8rem',
    color: '#e2e8f0',
    background: 'transparent',
  },
  loadingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#94a3b8',
    display: 'inline-block',
    animation: 'chatBounce 1.4s infinite ease-in-out both',
  },
  inputAreaWrapper: {
    padding: '16px 24px',
    background: 'transparent',
    flexShrink: 0,
  },
  chatInputForm: {
    maxWidth: '820px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    background: 'rgba(14, 14, 24, 0.55)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '30px',
    padding: '6px 6px 6px 18px',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  chatInputField: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: '8px 0',
    color: '#fff',
    outline: 'none',
    fontSize: '0.92rem',
    ':focus': {
      border: 'none',
      boxShadow: 'none',
    }
  },
  chatSendBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
    flexShrink: 0,
    color: '#fff',
  },
  inputDisclaimer: {
    textAlign: 'center',
    fontSize: '0.68rem',
    color: '#475569',
    marginTop: '8px',
  },
  chatInspector: {
    borderRadius: '16px',
    background: 'rgba(14, 14, 24, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
  },
  inspectorTitle: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#fff',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '12px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'Outfit',
  },
  inspectorContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inspectorCard: {
    padding: '16px',
    background: 'rgba(0,0,0,0.15)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
  },
  inspectorMetaRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  inspectorLabel: {
    fontSize: '0.68rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.02em',
  },
  inspectorVal: {
    fontSize: '0.92rem',
    fontWeight: '600',
    color: '#fff',
    marginTop: '2px',
  },
  inspectorSectionTitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: '600',
    fontFamily: 'Outfit',
  },
  timelineBox: {
    padding: '14px 16px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  emptyInspector: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: '#64748b',
    textAlign: 'center',
    fontSize: '0.85rem',
    padding: '0 20px',
  },
};
