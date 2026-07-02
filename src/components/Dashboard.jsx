import React, { useState, useEffect, useCallback } from 'react';
import { Key, Database, Zap, Flame, Clock, Shield, Sparkles } from 'lucide-react';
import Header from './dashboard/Header';
import Sidebar from './dashboard/Sidebar';
import KeysTab from './dashboard/KeysTab';
import ModelsTab from './dashboard/ModelsTab';
import MappingsTab from './dashboard/MappingsTab';
import AnalyticsTab from './dashboard/AnalyticsTab';
import LogsTab from './dashboard/LogsTab';
import SandboxTab from './dashboard/SandboxTab';
import GuideTab from './dashboard/GuideTab';
import ProfileTab from './dashboard/ProfileTab';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Dashboard({ token, username, roles, onLogout }) {
  const isAdmin = roles.includes('ROLE_ADMIN');
  const [activeTab, setActiveTab] = useState(isAdmin ? 'keys' : 'sandbox');
  const [healthData, setHealthData] = useState(null);
  const [keysList, setKeysList] = useState([]);
  const [modelsList, setModelsList] = useState([]);
  const [logsList, setLogsList] = useState([]);
  const [mappingsList, setMappingsList] = useState([]);
  
  // Mapping forms state
  const [showMappingForm, setShowMappingForm] = useState(false);
  const [mappingForm, setMappingForm] = useState({ keyId: '', modelId: '' });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search, filtering, sorting states
  const [keySearch, setKeySearch] = useState('');
  const [keyStatusFilter, setKeyStatusFilter] = useState('');
  const [keySortField, setKeySortField] = useState('name');
  const [keySortOrder, setKeySortOrder] = useState('asc');

  const [modelSearch, setModelSearch] = useState('');

  // UI state enhancers
  const [copiedId, setCopiedId] = useState('');
  const [selectedChatMsgId, setSelectedChatMsgId] = useState(null);

  // Chatbot states
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am Axon's Gemini Routing Chatbot. I automatically select the most appropriate Gemini model and API key for your requests, and seamlessly handle failovers and model fallbacks if keys are rate-limited or disabled. Try asking me something or click a preset below!",
      timestamp: new Date(),
      routingData: null
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Forms states
  const [keyForm, setKeyForm] = useState({
    id: '', name: '', provider: 'gemini', keyValue: '', 
    models: '', limitRpm: 100, limitTpm: 200000, 
    cooldownDurationSeconds: 10, active: true
  });
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [showKeyForm, setShowKeyForm] = useState(false);

  const [modelForm, setModelForm] = useState({
    id: '', provider: 'gemini', name: '', displayName: '', active: true
  });
  const [isEditingModel, setIsEditingModel] = useState(false);
  const [showModelForm, setShowModelForm] = useState(false);

  // Helper to copy to clipboard
  const handleCopyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  // Helper to quick toggle active state of key
  const handleToggleKeyActive = async (key) => {
    if (!isAdmin) return;
    const newActive = !key.active;
    const updatedPayload = {
      ...key,
      active: newActive,
      status: newActive ? 'ACTIVE' : 'DISABLED',
      keyValue: ''
    };
    
    // Optimistically update frontend state
    setKeysList(prev => prev.map(k => k.id === key.id ? { ...k, active: newActive, status: newActive ? 'ACTIVE' : 'DISABLED' } : k));
    
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/keys/${key.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPayload)
      });
      if (response && response.ok) {
        triggerAlert('success', `Key '${key.name}' is now ${newActive ? 'Active' : 'Inactive'}.`);
        loadData();
      } else {
        // Rollback state if failed
        setKeysList(prev => prev.map(k => k.id === key.id ? key : k));
        throw new Error('Failed to update key status');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  const getSparklinePath = () => {
    if (logsList.length === 0) {
      return "M 5,15 L 75,15";
    }
    const recentLogs = logsList.slice(0, 8).reverse();
    const latencies = recentLogs.map(l => l.latencyMs);
    const maxLat = Math.max(...latencies, 100);
    const minLat = Math.min(...latencies, 0);
    const range = maxLat - minLat || 1;
    
    const points = recentLogs.map((log, index) => {
      const x = (index / Math.max(1, recentLogs.length - 1)) * 70 + 5;
      const y = 25 - ((log.latencyMs - minLat) / range) * 20;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Authenticated fetch wrapper
  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const headers = {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401) {
        onLogout();
        return null;
      }
      return response;
    } catch (err) {
      console.error("Network error: ", err);
      throw err;
    }
  }, [token, onLogout]);

  // Fetch health stats
  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/health`);
      if (response && response.ok) {
        const data = await response.json();
        setHealthData(data);
      }
    } catch (err) {
      console.error("Error fetching health data", err);
    }
  }, [fetchWithAuth]);

  // Fetch keys
  const fetchKeys = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/keys`);
      if (response && response.ok) {
        const data = await response.json();
        setKeysList(data);
      }
    } catch (err) {
      console.error("Error fetching keys", err);
    }
  }, [fetchWithAuth]);

  // Fetch models
  const fetchModels = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/models`);
      if (response && response.ok) {
        const data = await response.json();
        setModelsList(data);
      }
    } catch (err) {
      console.error("Error fetching models", err);
    }
  }, [fetchWithAuth]);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/logs`);
      if (response && response.ok) {
        const data = await response.json();
        setLogsList(data);
      }
    } catch (err) {
      console.error("Error fetching logs", err);
    }
  }, [fetchWithAuth]);

  // Fetch mappings
  const fetchMappings = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/mappings`);
      if (response && response.ok) {
        const data = await response.json();
        setMappingsList(data);
      }
    } catch (err) {
      console.error("Error fetching mappings", err);
    }
  }, [fetchWithAuth]);

  const loadData = useCallback(() => {
    if (!isAdmin) return;
    setLoading(true);
    Promise.all([
      fetchHealth(),
      fetchKeys(),
      fetchModels(),
      fetchLogs(),
      fetchMappings()
    ]).finally(() => setLoading(false));
  }, [isAdmin, fetchHealth, fetchKeys, fetchModels, fetchLogs, fetchMappings]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const triggerAlert = (type, msg) => {
    if (type === 'error') {
      setError(msg);
      setTimeout(() => setError(''), 5000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  // --- CRUD API Key ---
  const handleKeySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...keyForm,
        provider: 'gemini',
        allowedModels: keyForm.models.split(',').map(m => m.trim()).filter(Boolean),
        models: keyForm.models.split(',').map(m => m.trim()).filter(Boolean)
      };
      
      const url = isEditingKey 
        ? `${BASE_URL}/api/v1/admin/keys/${keyForm.id}`
        : `${BASE_URL}/api/v1/admin/keys`;
      const method = isEditingKey ? 'PUT' : 'POST';
      
      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response && response.ok) {
        triggerAlert('success', `API Key ${isEditingKey ? 'modified' : 'registered'} successfully.`);
        setShowKeyForm(false);
        setIsEditingKey(false);
        setKeyForm({ id: '', name: '', provider: 'gemini', keyValue: '', models: '', limitRpm: 100, limitTpm: 200000, cooldownDurationSeconds: 10, active: true });
        loadData();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to save API Key.');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditKeyClick = (key) => {
    setKeyForm({
      id: key.id,
      name: key.name,
      provider: 'gemini',
      keyValue: '', // mask
      models: (key.allowedModels || key.models || []).join(', '),
      limitRpm: key.limitRpm,
      limitTpm: key.limitTpm,
      cooldownDurationSeconds: key.cooldownDurationSeconds,
      active: key.active
    });
    setIsEditingKey(true);
    setShowKeyForm(true);
  };

  const handleDeleteKey = async (id) => {
    if (!window.confirm("Are you sure you want to delete this API Key?")) return;
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/keys/${id}`, {
        method: 'DELETE'
      });
      if (response && response.ok) {
        triggerAlert('success', 'API Key deleted successfully.');
        loadData();
      } else {
        throw new Error('Failed to delete API key.');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD AI Model ---
  const handleModelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...modelForm,
        provider: 'gemini',
        modelName: modelForm.name.toLowerCase().trim()
      };
      
      const url = isEditingModel 
        ? `${BASE_URL}/api/v1/admin/models/${modelForm.id}`
        : `${BASE_URL}/api/v1/admin/models`;
      const method = isEditingModel ? 'PUT' : 'POST';
      
      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response && response.ok) {
        triggerAlert('success', `Model ${isEditingModel ? 'updated' : 'registered'} successfully.`);
        setShowModelForm(false);
        setIsEditingModel(false);
        setModelForm({ id: '', provider: 'gemini', name: '', displayName: '', active: true });
        loadData();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to save model.');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD Key-Model Mapping ---
  const handleMappingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappingForm)
      });
      if (response && response.ok) {
        triggerAlert('success', 'API Key mapping created successfully.');
        setShowMappingForm(false);
        setMappingForm({ keyId: '', modelId: '' });
        loadData();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create mapping.');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMapping = async (id) => {
    if (!window.confirm("Are you sure you want to delete this key-model mapping?")) return;
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/mappings/${id}`, {
        method: 'DELETE'
      });
      if (response && response.ok) {
        triggerAlert('success', 'Mapping deleted successfully.');
        loadData();
      } else {
        throw new Error('Failed to delete mapping.');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Cooldown Management ---
  const handleTriggerCooldown = async (keyId) => {
    const reason = window.prompt("Enter reason for cooldown override:", "ADMIN_TRIGGERED");
    if (reason === null) return;
    const duration = parseInt(window.prompt("Enter cooldown duration in seconds:", "60")) || 60;
    
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/keys/${keyId}/cooldown?reason=${encodeURIComponent(reason)}&durationSeconds=${duration}`, {
        method: 'POST'
      });
      if (response && response.ok) {
        triggerAlert('success', 'Cooldown override activated.');
        loadData();
      } else {
        throw new Error('Failed to trigger cooldown override.');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCooldown = async (keyId) => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/keys/${keyId}/cooldown`, {
        method: 'DELETE'
      });
      if (response && response.ok) {
        triggerAlert('success', 'Cooldown override cleared.');
        loadData();
      } else {
        throw new Error('Failed to clear cooldown.');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Chatbot Submission ---
  const handleChatSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const promptText = chatInput;
    setChatInput('');
    sendPromptToChatbot(promptText);
  };

  const sendPromptToChatbot = async (promptText) => {
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptText,
      timestamp: new Date(),
      routingData: null
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/proxy/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: 'gemini',
          model: 'auto',
          prompt: promptText,
          estimatedTokens: 150
        })
      });

      if (!response) {
        throw new Error("No response from gateway");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Proxy execution failed.');
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.responseText,
        timestamp: new Date(),
        routingData: data
      };

      setChatMessages(prev => [...prev, botMsg]);
      setSelectedChatMsgId(botMsg.id);
      loadData();
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `Routing Failover Exhausted: ${err.message}`,
        timestamp: new Date(),
        isError: true,
        routingData: null
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={styles.dashboardContainer} className="animate-fade-in">
      {/* Alert Notices */}
      {error && (
        <div style={styles.floatingAlertError} className="animate-fade-in">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div style={styles.floatingAlertSuccess} className="animate-fade-in">
          <span>{success}</span>
        </div>
      )}

      {/* Top Header Panel */}
      <Header
        username={username}
        roles={roles}
        isAdmin={isAdmin}
        loading={loading}
        loadData={loadData}
        onLogout={onLogout}
        healthData={healthData}
        styles={styles}
      />

      {/* System Health Metric Bar (Admin) */}
      {isAdmin && healthData && (
        <section style={styles.metricsBar}>
          
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
            <div style={{...styles.metricIconBox, background: 'rgba(168, 85, 247, 0.1)'}}><Clock size={20} color="#a855f7" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <span style={styles.metricVal}>
                  {logsList.length > 0 ? `${Math.round(logsList.reduce((acc, l) => acc + l.latencyMs, 0) / logsList.length)}ms` : '0ms'}
                </span>
                {logsList.length > 0 && (
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

      {/* Developer API Status Metric Bar (Client) */}
      {!isAdmin && (
        <section style={styles.metricsBar}>
          <div className="glass-container" style={{...styles.metricCard, gridColumn: 'span 2'}}>
            <div style={{...styles.metricIconBox, background: 'rgba(59, 130, 246, 0.1)'}}><Database size={20} color="#3b82f6" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={styles.metricLabel}>API Gateway Endpoint</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <code style={{ fontSize: '0.8rem', color: '#fff', background: 'rgba(0,0,0,0.25)', padding: '4px 8px', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', flex: 1 }}>
                  {`${BASE_URL}/api/v1/proxy/chat`}
                </code>
                <button 
                  type="button" 
                  onClick={() => handleCopyToClipboard(`${BASE_URL}/api/v1/proxy/chat`, 'endpoint')}
                  className="btn btn-secondary" 
                  style={{ padding: '6px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {copiedId === 'endpoint' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copiedId === 'endpoint' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="glass-container" style={styles.metricCard}>
            <div style={{...styles.metricIconBox, background: 'rgba(16, 185, 129, 0.1)'}}><Zap size={20} color="#10b981" /></div>
            <div>
              <div style={{...styles.metricVal, color: '#10b981'}}>ACTIVE</div>
              <div style={styles.metricLabel}>API Gateway Status</div>
            </div>
          </div>
          <div className="glass-container" style={styles.metricCard}>
            <div style={{...styles.metricIconBox, background: 'rgba(168, 85, 247, 0.1)'}}><Sparkles size={20} color="#a855f7" /></div>
            <div>
              <div style={{...styles.metricVal, color: '#a855f7'}}>ENABLED</div>
              <div style={styles.metricLabel}>Auto model Fallback</div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs Content Layout */}
      <div className="tab-content-layout">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} styles={styles} />

        {/* Main Work Content Panel */}
        <main className="glass-container" style={styles.mainPanel}>
          {activeTab === 'keys' && (
            <KeysTab
              isAdmin={isAdmin}
              keysList={keysList}
              keySearch={keySearch}
              setKeySearch={setKeySearch}
              keyStatusFilter={keyStatusFilter}
              setKeyStatusFilter={setKeyStatusFilter}
              keySortField={keySortField}
              setKeySortField={setKeySortField}
              keySortOrder={keySortOrder}
              setKeySortOrder={setKeySortOrder}
              keyForm={keyForm}
              setKeyForm={setKeyForm}
              isEditingKey={isEditingKey}
              setIsEditingKey={setIsEditingKey}
              showKeyForm={showKeyForm}
              setShowKeyForm={setShowKeyForm}
              handleKeySubmit={handleKeySubmit}
              handleEditKeyClick={handleEditKeyClick}
              handleToggleKeyActive={handleToggleKeyActive}
              handleClearCooldown={handleClearCooldown}
              handleTriggerCooldown={handleTriggerCooldown}
              handleDeleteKey={handleDeleteKey}
              styles={styles}
            />
          )}

          {activeTab === 'models' && (
            <ModelsTab
              isAdmin={isAdmin}
              modelsList={modelsList}
              modelSearch={modelSearch}
              setModelSearch={setModelSearch}
              modelForm={modelForm}
              setModelForm={setModelForm}
              showModelForm={showModelForm}
              setShowModelForm={setShowModelForm}
              isEditingModel={isEditingModel}
              setIsEditingModel={setIsEditingModel}
              handleModelSubmit={handleModelSubmit}
              styles={styles}
            />
          )}

          {activeTab === 'mappings' && (
            <MappingsTab
              isAdmin={isAdmin}
              keysList={keysList}
              modelsList={modelsList}
              mappingsList={mappingsList}
              showMappingForm={showMappingForm}
              setShowMappingForm={setShowMappingForm}
              mappingForm={mappingForm}
              setMappingForm={setMappingForm}
              handleMappingSubmit={handleMappingSubmit}
              handleDeleteMapping={handleDeleteMapping}
              styles={styles}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab logsList={logsList} styles={styles} />
          )}

          {activeTab === 'logs' && (
            <LogsTab
              logsList={logsList}
              handleCopyToClipboard={handleCopyToClipboard}
              copiedId={copiedId}
              styles={styles}
            />
          )}

          {activeTab === 'sandbox' && (
            <SandboxTab
              chatMessages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              chatLoading={chatLoading}
              selectedChatMsgId={selectedChatMsgId}
              setSelectedChatMsgId={setSelectedChatMsgId}
              sendPromptToChatbot={sendPromptToChatbot}
              handleChatSubmit={handleChatSubmit}
              handleCopyToClipboard={handleCopyToClipboard}
              copiedId={copiedId}
              styles={styles}
            />
          )}

          {activeTab === 'guide' && (
            <GuideTab
              BASE_URL={BASE_URL}
              token={token}
              handleCopyToClipboard={handleCopyToClipboard}
              copiedId={copiedId}
              styles={styles}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              username={username}
              roles={roles}
              styles={styles}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// Styling Object
const styles = {
  dashboardContainer: {
    padding: '24px',
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 'none',
    margin: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    marginBottom: '24px',
    background: 'rgba(18, 18, 30, 0.45)',
  },
  headerTitle: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    marginTop: '4px',
  },
  roleTag: {
    marginLeft: '6px',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    border: '1px solid',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  healthMiniBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  iconBtn: {
    padding: '10px',
    borderRadius: '8px',
  },
  logoutBtn: {
    padding: '10px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    ':hover': {
      background: 'rgba(239, 68, 68, 0.2)',
      color: '#fff',
    }
  },
  metricsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: 'rgba(18, 18, 30, 0.35)',
  },
  metricIconBox: {
    display: 'flex',
    padding: '10px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.05)',
  },
  metricVal: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#fff',
    lineHeight: '1.2',
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px',
    fontWeight: '500',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    background: 'rgba(18, 18, 30, 0.35)',
  },
  sidebarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '0.88rem',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  sidebarBtnActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(168, 85, 247, 0.12)',
    color: '#d8b4fe',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: 'inset 0 0 0 1px rgba(168, 85, 247, 0.25)',
  },
  mainPanel: {
    padding: '24px',
    minHeight: '600px',
    background: 'rgba(18, 18, 30, 0.45)',
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  tabTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
    fontFamily: 'Outfit',
  },
  tabSubtitle: {
    fontSize: '0.82rem',
    color: '#64748b',
    marginTop: '4px',
  },
  inlineForm: {
    background: 'rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '16px',
    fontFamily: 'Outfit',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  formLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: '6px',
    letterSpacing: '0.02em',
  },
  checkboxWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '28px',
  },
  checkboxInput: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.88rem',
    color: '#94a3b8',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    justifyContent: 'flex-end',
  },
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  searchInput: {
    width: '240px',
  },
  filterSelect: {
    width: '150px',
  },
  sortLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  sortOrderBtn: {
    padding: '9px 12px',
    fontSize: '0.75rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 16px',
    borderBottom: '2px solid rgba(255,255,255,0.06)',
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.2s',
    ':hover': {
      background: 'rgba(255,255,255,0.01)',
    }
  },
  td: {
    padding: '14px 16px',
    fontSize: '0.88rem',
    color: '#e2e8f0',
  },
  miniTag: {
    fontSize: '0.65rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#94a3b8',
  },
  modelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  modelCard: {
    padding: '20px',
    background: 'rgba(18, 18, 30, 0.35)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  modelCardHeader: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  modelIconBox: {
    display: 'flex',
    padding: '8px',
    borderRadius: '8px',
    background: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.15)',
  },
  modelTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  modelCode: {
    fontSize: '0.72rem',
    color: '#64748b',
  },
  modelCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    paddingTop: '12px',
  },
  selectStyle: {
    appearance: 'none',
    background: 'rgba(0,0,0,0.25)',
  },
  mappingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  mappingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: 'rgba(18, 18, 30, 0.35)',
    gap: '20px',
    flexWrap: 'wrap',
  },
  mappingEntity: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  chartCard: {
    padding: '24px',
    background: 'rgba(18, 18, 30, 0.35)',
  },
  chartTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '20px',
    fontFamily: 'Outfit',
  },
  barList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  barRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  barLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  barOuter: {
    height: '6px',
    width: '100%',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    borderRadius: '3px',
  },
  logModel: {
    fontSize: '0.75rem',
    background: 'rgba(59,130,246,0.1)',
    color: '#93c5fd',
    padding: '2px 8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    border: '1px solid rgba(59,130,246,0.15)',
  },
  guideContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '16px',
  },
  floatingAlertError: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: '#ef4444',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '8px',
    boxShadow: '0 8px 30px rgba(239, 68, 68, 0.25)',
    zIndex: 9999,
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  floatingAlertSuccess: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: '#10b981',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '8px',
    boxShadow: '0 8px 30px rgba(16, 185, 129, 0.25)',
    zIndex: 9999,
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  metaResponseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '16px',
    background: 'rgba(0,0,0,0.15)',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  metaLabel: {
    fontSize: '0.65rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.02em',
    display: 'block',
  },
  metaVal: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#fff',
    marginTop: '2px',
  },
  responseTextBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  responseTextTitle: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
  responseTextPre: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(0,0,0,0.25)',
    color: '#e2e8f0',
    fontSize: '0.8rem',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    fontFamily: 'monospace',
  },
};
