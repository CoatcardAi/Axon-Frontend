import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import KeysTab from '../components/dashboard/KeysTab';
import { styles } from '../styles';

export default function KeysPage() {
  const { token, isAdmin, BASE_URL, triggerAlert, refreshTrigger } = useOutletContext();

  const [keysList, setKeysList] = useState([]);
  const [_loading, setLoading] = useState(false);

  // Search, filtering, sorting states
  const [keySearch, setKeySearch] = useState('');
  const [keyStatusFilter, setKeyStatusFilter] = useState('');
  const [keySortField, setKeySortField] = useState('name');
  const [keySortOrder, setKeySortOrder] = useState('asc');

  // Forms states
  const [keyForm, setKeyForm] = useState({
    id: '', name: '', provider: 'gemini', keyValue: '', 
    models: '', limitRpm: 100, limitTpm: 200000, 
    cooldownDurationSeconds: 10, active: true
  });
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [showKeyForm, setShowKeyForm] = useState(false);

  // Authenticated fetch helper
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
      return response;
    } catch (err) {
      console.error("Network error: ", err);
      throw err;
    }
  }, [token]);

  // Fetch keys
  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/keys`);
      if (response && response.ok) {
        const data = await response.json();
        setKeysList(data);
      }
    } catch (err) {
      console.error("Error fetching keys", err);
      triggerAlert('error', 'Failed to load API keys.');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, BASE_URL, triggerAlert]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys, refreshTrigger]);

  // Submit form
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
        fetchKeys();
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
        fetchKeys();
      } else {
        throw new Error('Failed to delete API key.');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleKeyActive = async (key) => {
    if (!isAdmin) return;
    const newActive = !key.active;
    const updatedPayload = {
      ...key,
      active: newActive,
      status: newActive ? 'ACTIVE' : 'DISABLED',
      keyValue: ''
    };
    
    // Optimistic update
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
        fetchKeys();
      } else {
        setKeysList(prev => prev.map(k => k.id === key.id ? key : k));
        throw new Error('Failed to update key status');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  const handleActivateAllKeys = async () => {
    if (!window.confirm("Are you sure you want to activate all API Keys in the pool?")) return;
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/keys/activate-all`, {
        method: 'POST'
      });
      if (response && response.ok) {
        triggerAlert('success', 'All API keys have been activated.');
        fetchKeys();
      } else {
        throw new Error('Failed to activate keys.');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

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
        fetchKeys();
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
        fetchKeys();
      } else {
        throw new Error('Failed to clear cooldown.');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
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
      handleActivateAllKeys={handleActivateAllKeys}
      styles={styles}
    />
  );
}
