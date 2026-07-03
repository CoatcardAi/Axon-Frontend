import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import ModelsTab from '../components/dashboard/ModelsTab';
import { styles } from '../styles';

export default function ModelsPage() {
  const { token, isAdmin, BASE_URL, triggerAlert, refreshTrigger } = useOutletContext();

  const [modelsList, setModelsList] = useState([]);
  const [_loading, setLoading] = useState(false);

  // Search & filtering
  const [modelSearch, setModelSearch] = useState('');
  const [modelProviderFilter, setModelProviderFilter] = useState('');

  // Form states
  const [modelForm, setModelForm] = useState({
    id: '', provider: 'gemini', name: '', displayName: '', active: true, priority: 1
  });
  const [isEditingModel, setIsEditingModel] = useState(false);
  const [showModelForm, setShowModelForm] = useState(false);

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

  // Fetch models
  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/models`);
      if (response && response.ok) {
        const data = await response.json();
        setModelsList(data);
      }
    } catch (err) {
      console.error("Error fetching models", err);
      triggerAlert('error', 'Failed to load AI models.');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, BASE_URL, triggerAlert]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels, refreshTrigger]);

  // CRUD handlers
  const handleModelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...modelForm,
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

      if (!response) return;
      if (!response.ok) throw new Error('Failed to save AI model');
      
      const savedModel = await response.json();
      
      triggerAlert('success', `Model successfully ${isEditingModel ? 'updated' : 'created'}!`);
      setShowModelForm(false);
      setIsEditingModel(false);
      setModelForm({ id: '', provider: 'gemini', name: '', displayName: '', active: true, priority: 1 });
      
      // Optimistic update
      if (isEditingModel) {
        setModelsList(prev => prev.map(m => m.id === savedModel.id ? savedModel : m));
      } else {
        setModelsList(prev => [...prev, savedModel]);
      }
      fetchModels();
    } catch (err) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditModel = (model) => {
    setModelForm({
      id: model.id,
      provider: model.provider || 'gemini',
      name: model.name,
      displayName: model.displayName,
      active: model.active,
      priority: model.priority !== undefined ? model.priority : 1
    });
    setIsEditingModel(true);
    setShowModelForm(true);
  };

  const handleDeleteModel = async (id) => {
    if (!window.confirm("Are you sure you want to delete this model?")) return;
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/models/${id}`, {
        method: 'DELETE'
      });
      if (!response) return;
      if (!response.ok) throw new Error('Failed to delete model');
      triggerAlert('success', 'Model deleted.');
      
      // Optimistic update
      setModelsList(prev => prev.filter(m => m.id !== id));
      fetchModels();
    } catch (err) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModelActive = async (model) => {
    setLoading(true);
    const newActive = !model.active;
    
    // Optimistic update
    setModelsList(prev => prev.map(m => m.id === model.id ? { ...m, active: newActive, enabled: newActive } : m));

    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/models/${model.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...model, active: newActive, enabled: newActive })
      });
      if (!response) return;
      if (!response.ok) throw new Error('Failed to toggle model status');
      
      const updatedModel = await response.json();
      triggerAlert('success', `Model '${model.displayName}' successfully ${newActive ? 'enabled' : 'disabled'}!`);
      setModelsList(prev => prev.map(m => m.id === updatedModel.id ? updatedModel : m));
      fetchModels();
    } catch (err) {
      // Revert optimism
      setModelsList(prev => prev.map(m => m.id === model.id ? model : m));
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModelsTab
      isAdmin={isAdmin}
      modelsList={modelsList}
      modelSearch={modelSearch}
      setModelSearch={setModelSearch}
      modelProviderFilter={modelProviderFilter}
      setModelProviderFilter={setModelProviderFilter}
      modelForm={modelForm}
      setModelForm={setModelForm}
      showModelForm={showModelForm}
      setShowModelForm={setShowModelForm}
      isEditingModel={isEditingModel}
      setIsEditingModel={setIsEditingModel}
      handleModelSubmit={handleModelSubmit}
      handleEditModel={handleEditModel}
      handleToggleModelActive={handleToggleModelActive}
      handleDeleteModel={handleDeleteModel}
      styles={styles}
    />
  );
}
