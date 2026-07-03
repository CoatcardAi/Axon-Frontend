import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import MappingsTab from '../components/dashboard/MappingsTab';
import { styles } from '../styles';

export default function MappingsPage() {
  const { token, isAdmin, BASE_URL, triggerAlert, refreshTrigger } = useOutletContext();

  const [mappingsList, setMappingsList] = useState([]);
  const [keysList, setKeysList] = useState([]);
  const [modelsList, setModelsList] = useState([]);
  const [_loading, setLoading] = useState(false);

  const [showMappingForm, setShowMappingForm] = useState(false);
  const [mappingForm, setMappingForm] = useState({ keyId: '', modelId: '' });

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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mapsRes, keysRes, modelsRes] = await Promise.all([
        fetchWithAuth(`${BASE_URL}/api/v1/admin/mappings`),
        fetchWithAuth(`${BASE_URL}/api/v1/admin/keys`),
        fetchWithAuth(`${BASE_URL}/api/v1/admin/models`)
      ]);

      if (mapsRes && mapsRes.ok) {
        const data = await mapsRes.json();
        setMappingsList(data);
      }
      if (keysRes && keysRes.ok) {
        const data = await keysRes.json();
        setKeysList(data);
      }
      if (modelsRes && modelsRes.ok) {
        const data = await modelsRes.json();
        setModelsList(data);
      }
    } catch (err) {
      console.error("Error fetching mappings page data", err);
      triggerAlert('error', 'Failed to load mapping database data.');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, BASE_URL, triggerAlert]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

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

  return (
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
  );
}
