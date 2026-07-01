import React, { useState, useEffect, useCallback } from 'react';
import { 
  Key, Database, FileText, Send, Plus, Trash2, Edit2, 
  RefreshCw, Power, Flame, Zap, Shield, Play, LogOut, Check, X, ShieldAlert 
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Dashboard({ token, username, roles, onLogout }) {
  const [activeTab, setActiveTab] = useState('keys');
  const [healthData, setHealthData] = useState(null);
  const [keysList, setKeysList] = useState([]);
  const [modelsList, setModelsList] = useState([]);
  const [logsList, setLogsList] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Forms states
  const [keyForm, setKeyForm] = useState({
    id: '', name: '', provider: 'openai', keyValue: '', 
    models: '', limitRpm: 60, limitTpm: 100000, 
    cooldownDurationSeconds: 15, active: true
  });
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [showKeyForm, setShowKeyForm] = useState(false);

  const [modelForm, setModelForm] = useState({
    id: '', provider: 'openai', name: '', displayName: '', active: true
  });
  const [isEditingModel, setIsEditingModel] = useState(false);
  const [showModelForm, setShowModelForm] = useState(false);

  const [sandboxForm, setSandboxForm] = useState({
    provider: 'openai', model: 'gpt-4o', prompt: 'Hello, identify yourself and reply in 1 sentence.', estimatedTokens: 20
  });
  const [sandboxResponse, setSandboxResponse] = useState(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  const isAdmin = roles.includes('ROLE_ADMIN');

  // Fetch health stats
  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
      }
    } catch (err) {
      console.error("Error fetching health data", err);
    }
  }, [token]);

  // Fetch keys
  const fetchKeys = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/keys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setKeysList(data);
      }
    } catch (err) {
      console.error("Error fetching keys", err);
    }
  }, [token]);

  // Fetch models
  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/models`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setModelsList(data);
      }
    } catch (err) {
      console.error("Error fetching models", err);
    }
  }, [token]);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLogsList(data);
      }
    } catch (err) {
      console.error("Error fetching logs", err);
    }
  }, [token]);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([fetchHealth(), fetchKeys(), fetchModels(), fetchLogs()])
      .finally(() => setLoading(false));
  }, [fetchHealth, fetchKeys, fetchModels, fetchLogs]);

  useEffect(() => {
    loadData();
    // Auto-refresh stats and logs every 10 seconds
    const interval = setInterval(() => {
      fetchHealth();
      fetchLogs();
    }, 10000);
    return () => clearInterval(interval);
  }, [loadData, fetchHealth, fetchLogs]);

  // Alert handler
  const triggerAlert = (type, msg) => {
    if (type === 'error') {
      setError(msg);
      setTimeout(() => setError(''), 5000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  // --- API Key Actions ---
  const handleKeySubmit = async (e) => {
    e.preventDefault();
    const url = isEditingKey 
      ? `${BASE_URL}/api/v1/admin/keys/${keyForm.id}`
      : `${BASE_URL}/api/v1/admin/keys`;
    const method = isEditingKey ? 'PUT' : 'POST';

    const payload = {
      ...keyForm,
      models: keyForm.models.split(',').map(m => m.trim()).filter(Boolean)
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save API key');
      
      triggerAlert('success', `Key successfully ${isEditingKey ? 'updated' : 'created'}!`);
      setShowKeyForm(false);
      setIsEditingKey(false);
      setKeyForm({
        id: '', name: '', provider: 'openai', keyValue: '', 
        models: '', limitRpm: 60, limitTpm: 100000, 
        cooldownDurationSeconds: 15, active: true
      });
      loadData();
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  const handleEditKey = (key) => {
    setKeyForm({
      id: key.id,
      name: key.name,
      provider: key.provider,
      keyValue: key.keyValue || '',
      models: key.models ? key.models.join(', ') : '',
      limitRpm: key.limitRpm,
      limitTpm: key.limitTpm,
      cooldownDurationSeconds: key.cooldownDurationSeconds,
      active: key.active
    });
    setIsEditingKey(true);
    setShowKeyForm(true);
  };

  const handleDeleteKey = async (id) => {
    if (!window.confirm("Are you sure you want to delete this key?")) return;
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/keys/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete key');
      triggerAlert('success', 'Key deleted.');
      loadData();
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  const handleTriggerCooldown = async (id) => {
    const reason = window.prompt("Reason for manual cooldown override:", "Admin manual override");
    if (reason === null) return;
    const duration = window.prompt("Cooldown duration in seconds:", "60");
    if (!duration) return;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/keys/${id}/cooldown?reason=${encodeURIComponent(reason)}&durationSeconds=${duration}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to trigger cooldown');
      triggerAlert('success', 'Manual cooldown activated.');
      loadData();
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  const handleClearCooldown = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/keys/${id}/cooldown`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to clear cooldown');
      triggerAlert('success', 'Cooldown cleared.');
      loadData();
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  // --- Model Actions ---
  const handleModelSubmit = async (e) => {
    e.preventDefault();
    const url = isEditingModel 
      ? `${BASE_URL}/api/v1/admin/models/${modelForm.id}`
      : `${BASE_URL}/api/v1/admin/models`;
    const method = isEditingModel ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(modelForm)
      });

      if (!response.ok) throw new Error('Failed to save AI model');
      
      triggerAlert('success', `Model successfully ${isEditingModel ? 'updated' : 'created'}!`);
      setShowModelForm(false);
      setIsEditingModel(false);
      setModelForm({ id: '', provider: 'openai', name: '', displayName: '', active: true });
      loadData();
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  const handleEditModel = (model) => {
    setModelForm({
      id: model.id,
      provider: model.provider,
      name: model.name,
      displayName: model.displayName,
      active: model.active
    });
    setIsEditingModel(true);
    setShowModelForm(true);
  };

  const handleDeleteModel = async (id) => {
    if (!window.confirm("Are you sure you want to delete this model?")) return;
    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/models/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete model');
      triggerAlert('success', 'Model deleted.');
      loadData();
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  // --- Sandbox / Proxy Test ---
  const handleSandboxSubmit = async (e) => {
    e.preventDefault();
    setSandboxLoading(true);
    setSandboxResponse(null);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/proxy/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sandboxForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Proxy execution failed.');
      setSandboxResponse(data);
      loadData();
    } catch (err) {
      triggerAlert('error', err.message);
    } finally {
      setSandboxLoading(false);
    }
  };

  return (
    <div style={styles.dashboardContainer} className="animate-fade-in">
      {/* Top Navbar */}
      <header className="glass-container" style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoBadge}>
            <Shield size={20} color="#a855f7" />
          </div>
          <div>
            <h1 style={styles.headerTitle} className="glow-text">Axon Core</h1>
            <p style={styles.headerSubtitle}>Scheduler Control Center</p>
          </div>
        </div>
        
        <div style={styles.headerRight}>
          <span style={styles.userInfo}>
            Signed in as <strong>{username}</strong> <span style={styles.roleTag}>{roles[0]?.replace('ROLE_', '')}</span>
          </span>
          
          <button onClick={loadData} className="btn btn-secondary" style={styles.iconBtn} title="Force Refresh">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
          
          <button onClick={onLogout} className="btn btn-danger" style={styles.logoutBtn}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Alerts */}
      {error && <div style={styles.errorAlert}><ShieldAlert size={16} /> {error}</div>}
      {success && <div style={styles.successAlert}><Check size={16} /> {success}</div>}

      {/* System Health Metric Bar */}
      {healthData && (
        <section style={styles.metricsBar}>
          <div className="glass-container" style={styles.metricCard}>
            <div style={styles.metricIconBox}><Key size={20} color="#f8fafc" /></div>
            <div>
              <div style={styles.metricVal}>{healthData.totalKeys}</div>
              <div style={styles.metricLabel}>Total Keys</div>
            </div>
          </div>
          <div className="glass-container" style={styles.metricCard}>
            <div style={{...styles.metricIconBox, background: 'rgba(16, 185, 129, 0.1)'}}><Zap size={20} color="#10b981" /></div>
            <div>
              <div style={{...styles.metricVal, color: '#10b981'}}>{healthData.activeKeys}</div>
              <div style={styles.metricLabel}>Active Keys</div>
            </div>
          </div>
          <div className="glass-container" style={styles.metricCard}>
            <div style={{...styles.metricIconBox, background: 'rgba(245, 158, 11, 0.1)'}}><Flame size={20} color="#f59e0b" /></div>
            <div>
              <div style={{...styles.metricVal, color: '#f59e0b'}}>{healthData.cooldownKeys}</div>
              <div style={styles.metricLabel}>In Cooldown</div>
            </div>
          </div>
          <div className="glass-container" style={styles.metricCard}>
            <div style={{...styles.metricIconBox, background: 'rgba(239, 68, 68, 0.1)'}}><Power size={20} color="#ef4444" /></div>
            <div>
              <div style={{...styles.metricVal, color: '#ef4444'}}>{healthData.inactiveKeys}</div>
              <div style={styles.metricLabel}>Inactive Keys</div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs Layout */}
      <div style={styles.tabContentLayout}>
        {/* Navigation Sidebar */}
        <aside className="glass-container" style={styles.sidebar}>
          <button 
            onClick={() => setActiveTab('keys')}
            style={activeTab === 'keys' ? styles.sidebarBtnActive : styles.sidebarBtn}
          >
            <Key size={18} />
            <span>API Keys</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('models')}
            style={activeTab === 'models' ? styles.sidebarBtnActive : styles.sidebarBtn}
          >
            <Database size={18} />
            <span>AI Models</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('logs')}
            style={activeTab === 'logs' ? styles.sidebarBtnActive : styles.sidebarBtn}
          >
            <FileText size={18} />
            <span>Logs</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('sandbox')}
            style={activeTab === 'sandbox' ? styles.sidebarBtnActive : styles.sidebarBtn}
          >
            <Play size={18} />
            <span>Router Test</span>
          </button>
        </aside>

        {/* Tab Panel */}
        <main className="glass-container" style={styles.mainPanel}>
          {/* TAB 1: API KEYS */}
          {activeTab === 'keys' && (
            <div>
              <div style={styles.tabHeader}>
                <div>
                  <h2 style={styles.tabTitle}>API Key Pool</h2>
                  <p style={styles.tabSubtitle}>Manage provider tokens, limits, concurrency, and overrides.</p>
                </div>
                {isAdmin && !showKeyForm && (
                  <button onClick={() => setShowKeyForm(true)} className="btn btn-primary">
                    <Plus size={16} /> New Key
                  </button>
                )}
              </div>

              {/* Form Inline */}
              {showKeyForm && isAdmin && (
                <form onSubmit={handleKeySubmit} style={styles.inlineForm} className="animate-fade-in">
                  <h3 style={styles.formTitle}>{isEditingKey ? 'Modify Key' : 'Add API Key'}</h3>
                  <div style={styles.formGrid}>
                    <div>
                      <label style={styles.formLabel}>Friendly Name</label>
                      <input 
                        type="text" required className="input-field" 
                        value={keyForm.name} onChange={e => setKeyForm({...keyForm, name: e.target.value})} 
                        placeholder="e.g. OpenAI Enterprise"
                      />
                    </div>
                    <div>
                      <label style={styles.formLabel}>Provider</label>
                      <select 
                        className="input-field" value={keyForm.provider} 
                        onChange={e => setKeyForm({...keyForm, provider: e.target.value})}
                        style={styles.selectStyle}
                      >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="gemini">Google Gemini</option>
                        <option value="cohere">Cohere</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.formLabel}>API Key Value</label>
                      <input 
                        type="password" required={!isEditingKey} className="input-field" 
                        value={keyForm.keyValue} onChange={e => setKeyForm({...keyForm, keyValue: e.target.value})} 
                        placeholder={isEditingKey ? "Leave blank to keep same" : "sk-..."}
                      />
                    </div>
                    <div>
                      <label style={styles.formLabel}>Supported Models (comma-separated)</label>
                      <input 
                        type="text" className="input-field" 
                        value={keyForm.models} onChange={e => setKeyForm({...keyForm, models: e.target.value})} 
                        placeholder="e.g. gpt-4o, gpt-3.5-turbo"
                      />
                    </div>
                    <div>
                      <label style={styles.formLabel}>Requests Per Min (RPM)</label>
                      <input 
                        type="number" className="input-field" 
                        value={keyForm.limitRpm} onChange={e => setKeyForm({...keyForm, limitRpm: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label style={styles.formLabel}>Tokens Per Min (TPM)</label>
                      <input 
                        type="number" className="input-field" 
                        value={keyForm.limitTpm} onChange={e => setKeyForm({...keyForm, limitTpm: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label style={styles.formLabel}>Cooldown Duration (Sec)</label>
                      <input 
                        type="number" className="input-field" 
                        value={keyForm.cooldownDurationSeconds} onChange={e => setKeyForm({...keyForm, cooldownDurationSeconds: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div style={styles.checkboxWrapper}>
                      <input 
                        type="checkbox" id="activeKey" 
                        checked={keyForm.active} onChange={e => setKeyForm({...keyForm, active: e.target.checked})}
                        style={styles.checkboxInput}
                      />
                      <label htmlFor="activeKey" style={styles.checkboxLabel}>Active / Enabled</label>
                    </div>
                  </div>
                  <div style={styles.formActions}>
                    <button type="submit" className="btn btn-success">Save Key</button>
                    <button 
                      type="button" className="btn btn-secondary" 
                      onClick={() => { setShowKeyForm(false); setIsEditingKey(false); }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Table */}
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Provider</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Models</th>
                      <th style={styles.th}>Remaining (RPM / TPM)</th>
                      <th style={styles.th}>Concurrency</th>
                      {isAdmin && <th style={styles.th}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {healthData?.keyHealths?.map(k => {
                      const matchingKey = keysList.find(key => key.id === k.id);
                      return (
                        <tr key={k.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={styles.boldText}>{k.name}</div>
                            <code style={styles.miniKey}>{matchingKey?.keyValue || 'sk-••••...••••'}</code>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.providerTag}>{k.provider.toUpperCase()}</span>
                          </td>
                          <td style={styles.td}>
                            {k.inCooldown ? (
                              <span className="badge badge-cooldown" title={k.cooldownReason}>
                                <Flame size={12} /> Cooldown ({k.remainingCooldownSeconds}s)
                              </span>
                            ) : matchingKey && !matchingKey.active ? (
                              <span className="badge badge-inactive"><Power size={12} /> Inactive</span>
                            ) : (
                              <span className="badge badge-active"><Zap size={12} /> Eligible</span>
                            )}
                          </td>
                          <td style={styles.td}>
                            <div style={styles.modelTagsContainer}>
                              {matchingKey?.models?.map(m => (
                                <span key={m} style={styles.miniTag}>{m}</span>
                              ))}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.boldText}>{k.remainingRpm}</span> rpm / <span style={styles.boldText}>{k.remainingTpm}</span> tpm
                          </td>
                          <td style={styles.td}>
                            <span style={{...styles.concurrencyIndicator, color: k.currentConcurrency > 0 ? '#a855f7' : 'inherit'}}>
                              {k.currentConcurrency} active
                            </span>
                          </td>
                          {isAdmin && (
                            <td style={styles.td}>
                              <div style={styles.actionBtnsGroup}>
                                <button onClick={() => handleEditKey(matchingKey)} className="btn btn-secondary" style={styles.actionMiniBtn} title="Edit Key">
                                  <Edit2 size={13} />
                                </button>
                                {k.inCooldown ? (
                                  <button onClick={() => handleClearCooldown(k.id)} className="btn btn-success" style={styles.actionMiniBtn} title="Clear Cooldown">
                                    <Power size={13} />
                                  </button>
                                ) : (
                                  <button onClick={() => handleTriggerCooldown(k.id)} className="btn btn-danger" style={styles.actionMiniBtn} title="Force Cooldown">
                                    <Flame size={13} />
                                  </button>
                                )}
                                <button onClick={() => handleDeleteKey(k.id)} className="btn btn-danger" style={styles.actionMiniBtn} title="Delete Key">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: AI MODELS */}
          {activeTab === 'models' && (
            <div>
              <div style={styles.tabHeader}>
                <div>
                  <h2 style={styles.tabTitle}>AI Models</h2>
                  <p style={styles.tabSubtitle}>Manage models supported by Axon Router.</p>
                </div>
                {isAdmin && !showModelForm && (
                  <button onClick={() => setShowModelForm(true)} className="btn btn-primary">
                    <Plus size={16} /> Add Model
                  </button>
                )}
              </div>

              {/* Form Inline */}
              {showModelForm && isAdmin && (
                <form onSubmit={handleModelSubmit} style={styles.inlineForm} className="animate-fade-in">
                  <h3 style={styles.formTitle}>{isEditingModel ? 'Modify Model' : 'Register AI Model'}</h3>
                  <div style={styles.formGrid}>
                    <div>
                      <label style={styles.formLabel}>Model Name / ID</label>
                      <input 
                        type="text" required className="input-field" 
                        value={modelForm.name} onChange={e => setModelForm({...modelForm, name: e.target.value})} 
                        placeholder="e.g. gpt-4o"
                      />
                    </div>
                    <div>
                      <label style={styles.formLabel}>Display Name</label>
                      <input 
                        type="text" required className="input-field" 
                        value={modelForm.displayName} onChange={e => setModelForm({...modelForm, displayName: e.target.value})} 
                        placeholder="e.g. GPT-4o Flagship"
                      />
                    </div>
                    <div>
                      <label style={styles.formLabel}>Provider</label>
                      <select 
                        className="input-field" value={modelForm.provider} 
                        onChange={e => setModelForm({...modelForm, provider: e.target.value})}
                        style={styles.selectStyle}
                      >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="gemini">Google Gemini</option>
                        <option value="cohere">Cohere</option>
                      </select>
                    </div>
                    <div style={styles.checkboxWrapper}>
                      <input 
                        type="checkbox" id="activeModel" 
                        checked={modelForm.active} onChange={e => setModelForm({...modelForm, active: e.target.checked})}
                        style={styles.checkboxInput}
                      />
                      <label htmlFor="activeModel" style={styles.checkboxLabel}>Active / Enabled</label>
                    </div>
                  </div>
                  <div style={styles.formActions}>
                    <button type="submit" className="btn btn-success">Save Model</button>
                    <button 
                      type="button" className="btn btn-secondary" 
                      onClick={() => { setShowModelForm(false); setIsEditingModel(false); }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Models List Grid */}
              <div style={styles.modelsGrid}>
                {modelsList.map(m => (
                  <div key={m.id} className="glass-container" style={styles.modelItemCard}>
                    <div style={styles.modelHeader}>
                      <span style={styles.providerTag}>{m.provider.toUpperCase()}</span>
                      {m.active ? (
                        <span className="badge badge-active">Active</span>
                      ) : (
                        <span className="badge badge-inactive">Disabled</span>
                      )}
                    </div>
                    <h3 style={styles.modelNameText}>{m.displayName}</h3>
                    <code style={styles.modelCode}>{m.name}</code>
                    
                    {isAdmin && (
                      <div style={styles.modelActionsFooter}>
                        <button onClick={() => handleEditModel(m)} className="btn btn-secondary" style={styles.actionMiniBtn}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button onClick={() => handleDeleteModel(m.id)} className="btn btn-danger" style={styles.actionMiniBtn}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LOGS */}
          {activeTab === 'logs' && (
            <div>
              <div style={styles.tabHeader}>
                <div>
                  <h2 style={styles.tabTitle}>Usage Activity Logs</h2>
                  <p style={styles.tabSubtitle}>Real-time requests, scheduler actions, failover statistics, and latencies.</p>
                </div>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Timestamp</th>
                      <th style={styles.th}>Request Info</th>
                      <th style={styles.th}>Key Used</th>
                      <th style={styles.th}>Tokens (P/C)</th>
                      <th style={styles.th}>Latency</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsList.map(l => (
                      <tr key={l.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.logTime}>{new Date(l.timestamp).toLocaleString()}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.logProvider}>{l.provider?.toUpperCase()}</span>
                          <div style={styles.logModel}>{l.model}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.boldText}>{l.keyName}</div>
                        </td>
                        <td style={styles.td}>
                          <span>{l.promptTokens}</span> / <span style={styles.boldText}>{l.completionTokens}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.boldText}>{l.latencyMs}</span> ms
                        </td>
                        <td style={styles.td}>
                          {l.status === 'SUCCESS' ? (
                            <span className="badge badge-active" style={{padding: '2px 8px'}}>{l.status}</span>
                          ) : l.status.includes('ERROR') ? (
                            <span className="badge badge-inactive" title={l.errorMessage} style={{padding: '2px 8px'}}>{l.status}</span>
                          ) : (
                            <span className="badge badge-cooldown" style={{padding: '2px 8px'}}>{l.status}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SANDBOX / ROUTER TEST */}
          {activeTab === 'sandbox' && (
            <div>
              <div style={styles.tabHeader}>
                <div>
                  <h2 style={styles.tabTitle}>Router Test / Sandbox</h2>
                  <p style={styles.tabSubtitle}>Test the Axon Proxy routing directly from the UI and watch the scheduler pick a key in real-time.</p>
                </div>
              </div>

              <div style={styles.sandboxWrapper}>
                <form onSubmit={handleSandboxSubmit} className="glass-container" style={styles.sandboxFormStyle}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Provider</label>
                    <select 
                      className="input-field" value={sandboxForm.provider} 
                      onChange={e => setSandboxForm({...sandboxForm, provider: e.target.value})}
                      style={styles.selectStyle}
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="gemini">Google Gemini</option>
                      <option value="cohere">Cohere</option>
                    </select>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Model Name / ID</label>
                    <input 
                      type="text" className="input-field" 
                      value={sandboxForm.model} onChange={e => setSandboxForm({...sandboxForm, model: e.target.value})}
                      placeholder="e.g. gpt-4o, claude-3-5-sonnet"
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Estimated Tokens</label>
                    <input 
                      type="number" className="input-field" 
                      value={sandboxForm.estimatedTokens} onChange={e => setSandboxForm({...sandboxForm, estimatedTokens: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Prompt</label>
                    <textarea 
                      className="input-field" style={styles.textareaStyle} rows={3}
                      value={sandboxForm.prompt} onChange={e => setSandboxForm({...sandboxForm, prompt: e.target.value})}
                      placeholder="e.g. Write a tagline for an API Gateway..."
                    />
                    <div style={styles.promptTriggers}>
                      <span style={styles.triggerLabel}>Trigger Errors (Testing):</span>
                      <button type="button" onClick={() => setSandboxForm({...sandboxForm, prompt: "trigger_rate_limit"})} style={styles.triggerBtn}>Rate Limit (429)</button>
                      <button type="button" onClick={() => setSandboxForm({...sandboxForm, prompt: "trigger_provider_error"})} style={styles.triggerBtn}>Provider Error (500)</button>
                      <button type="button" onClick={() => setSandboxForm({...sandboxForm, prompt: "trigger_client_error"})} style={styles.triggerBtn}>Client Error (400)</button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={styles.runBtn} disabled={sandboxLoading}>
                    {sandboxLoading ? (
                      <>
                        <RefreshCw size={16} className="spin" style={{marginRight: '6px'}} />
                        Routing request...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Execute Prompt
                      </>
                    )}
                  </button>
                </form>

                {/* Sandbox Response Output */}
                <div className="glass-container" style={styles.sandboxOutputCard}>
                  <h3 style={styles.outputTitle}>Proxy Router Results</h3>
                  
                  {sandboxResponse ? (
                    <div style={styles.outputContent} className="animate-fade-in">
                      <div style={styles.metaResponseGrid}>
                        <div>
                          <div style={styles.metaLabel}>Key Selected</div>
                          <div style={styles.metaVal}>{sandboxResponse.selectedKeyName}</div>
                          <code style={styles.miniKey}>{sandboxResponse.selectedKeyId}</code>
                        </div>
                        <div>
                          <div style={styles.metaLabel}>Latency</div>
                          <div style={styles.metaVal}>{sandboxResponse.latencyMs} ms</div>
                        </div>
                        <div>
                          <div style={styles.metaLabel}>Total Tokens</div>
                          <div style={styles.metaVal}>{sandboxResponse.promptTokens + sandboxResponse.completionTokens}</div>
                          <div style={styles.miniKey}>{sandboxResponse.promptTokens} prompt + {sandboxResponse.completionTokens} completion</div>
                        </div>
                        <div>
                          <div style={styles.metaLabel}>Attempts</div>
                          <div style={styles.metaVal}>{sandboxResponse.attempts}</div>
                        </div>
                      </div>
                      
                      <div style={styles.responseTextBlock}>
                        <div style={styles.responseTextTitle}>Model Response Text:</div>
                        <pre style={styles.responseTextPre}>{sandboxResponse.responseText}</pre>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.emptyOutput}>
                      <Send size={32} color="#64748b" style={{marginBottom: '10px'}} />
                      <p>Run a prompt request to observe active scheduling decisions, rate updates, and failover fallbacks.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  dashboardContainer: {
    padding: '20px',
    maxWidth: '1280px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logoBadge: {
    padding: '8px',
    borderRadius: '8px',
    background: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.15)',
  },
  headerTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '0.05em',
  },
  headerSubtitle: {
    fontSize: '0.78rem',
    color: '#94a3b8',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userInfo: {
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  roleTag: {
    background: 'rgba(168, 85, 247, 0.15)',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    color: '#d8b4fe',
    fontSize: '0.7rem',
    padding: '1px 6px',
    borderRadius: '4px',
    marginLeft: '5px',
    fontWeight: 'bold',
  },
  iconBtn: {
    padding: '10px',
  },
  logoutBtn: {
    padding: '8px 14px',
    fontSize: '0.85rem',
  },
  metricsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  metricCard: {
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  metricIconBox: {
    padding: '12px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--glass-border)',
  },
  metricVal: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#fff',
    lineHeight: '1.2',
  },
  metricLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  tabContentLayout: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: '20px',
    alignItems: 'start',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    }
  },
  sidebar: {
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sidebarBtn: {
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.9rem',
    fontFamily: 'Outfit',
    fontWeight: '500',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  sidebarBtnActive: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(168, 85, 247, 0.08)',
    borderLeft: '3px solid #a855f7',
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    borderRadius: '0 8px 8px 0',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.9rem',
    fontFamily: 'Outfit',
    fontWeight: '600',
    textAlign: 'left',
  },
  mainPanel: {
    padding: '24px',
    minHeight: '400px',
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '16px',
  },
  tabTitle: {
    fontSize: '1.25rem',
    color: '#fff',
    fontWeight: '600',
  },
  tabSubtitle: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    marginTop: '2px',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 16px',
    fontSize: '0.78rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#94a3b8',
    borderBottom: '1px solid var(--glass-border)',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    transition: 'background 0.2s ease',
  },
  td: {
    padding: '14px 16px',
    fontSize: '0.88rem',
    verticalAlign: 'middle',
  },
  boldText: {
    fontWeight: '600',
    color: '#fff',
  },
  miniKey: {
    fontSize: '0.75rem',
    color: '#64748b',
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  providerTag: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f8fafc',
    fontSize: '0.72rem',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontFamily: 'Outfit',
  },
  miniTag: {
    background: 'rgba(168, 85, 247, 0.06)',
    border: '1px solid rgba(168, 85, 247, 0.12)',
    color: '#d8b4fe',
    fontSize: '0.72rem',
    padding: '1px 6px',
    borderRadius: '4px',
  },
  modelTagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    maxWidth: '220px',
  },
  concurrencyIndicator: {
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  actionBtnsGroup: {
    display: 'flex',
    gap: '6px',
  },
  actionMiniBtn: {
    padding: '6px',
    borderRadius: '6px',
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  successAlert: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: '#34d399',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inlineForm: {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  formLabel: {
    fontSize: '0.78rem',
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: '4px',
    display: 'block',
  },
  selectStyle: {
    appearance: 'none',
    cursor: 'pointer',
  },
  checkboxWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '25px',
  },
  checkboxInput: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.85rem',
    color: '#f8fafc',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
  },
  modelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  modelItemCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  modelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelNameText: {
    fontSize: '1.05rem',
    color: '#fff',
    fontWeight: '600',
    marginTop: '4px',
  },
  modelCode: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    background: 'rgba(0,0,0,0.2)',
    padding: '4px 8px',
    alignSelf: 'start',
  },
  modelActionsFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '10px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '12px',
  },
  logTime: {
    fontSize: '0.78rem',
    color: '#64748b',
  },
  logProvider: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#94a3b8',
    fontSize: '0.68rem',
    padding: '1px 5px',
    borderRadius: '3px',
    fontWeight: 'bold',
  },
  logModel: {
    fontSize: '0.82rem',
    color: '#fff',
    marginTop: '2px',
  },
  sandboxWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    alignItems: 'start',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    }
  },
  sandboxFormStyle: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  textareaStyle: {
    resize: 'vertical',
  },
  promptTriggers: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: '6px',
  },
  triggerLabel: {
    fontSize: '0.72rem',
    color: '#64748b',
  },
  triggerBtn: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--glass-border)',
    color: '#94a3b8',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.72rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  runBtn: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '8px',
  },
  sandboxOutputCard: {
    padding: '24px',
    minHeight: '380px',
    display: 'flex',
    flexDirection: 'column',
  },
  outputTitle: {
    fontSize: '1rem',
    color: '#fff',
    fontWeight: '600',
    marginBottom: '16px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '8px',
  },
  outputContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  metaResponseGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    background: 'rgba(0,0,0,0.15)',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
  },
  metaLabel: {
    fontSize: '0.72rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  metaVal: {
    fontSize: '0.98rem',
    color: '#fff',
    fontWeight: '600',
    marginTop: '2px',
  },
  responseTextBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  responseTextTitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
  responseTextPre: {
    background: 'rgba(0,0,0,0.25)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '0.88rem',
    lineHeight: '1.45',
    color: '#e2e8f0',
    whiteSpace: 'pre-wrap',
    fontFamily: 'ui-monospace, monospace',
    overflowY: 'auto',
    maxHeight: '200px',
  },
  emptyOutput: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: '#64748b',
    textAlign: 'center',
    fontSize: '0.88rem',
    padding: '0 20px',
  }
};
