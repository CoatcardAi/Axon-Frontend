import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import LogsTab from '../components/dashboard/LogsTab';
import { styles } from '../styles';

export default function LogsPage() {
  const { token, BASE_URL, triggerAlert, refreshTrigger } = useOutletContext();
  const [logsList, setLogsList] = useState([]);
  const [copiedId, setCopiedId] = useState('');
  const [_loading, setLoading] = useState(false);

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

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/v1/admin/logs`);
      if (response && response.ok) {
        const data = await response.json();
        setLogsList(data);
      }
    } catch (err) {
      console.error("Error fetching logs", err);
      triggerAlert('error', 'Failed to load transaction logs.');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, BASE_URL, triggerAlert]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshTrigger]);

  const handleCopyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <LogsTab
      logsList={logsList}
      handleCopyToClipboard={handleCopyToClipboard}
      copiedId={copiedId}
      styles={styles}
    />
  );
}
