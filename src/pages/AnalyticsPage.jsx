import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';
import { styles } from '../styles';

export default function AnalyticsPage() {
  const { token, BASE_URL, triggerAlert, refreshTrigger, healthData } = useOutletContext();
  const [logsList, setLogsList] = useState([]);
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
      console.error("Error fetching logs for analytics", err);
      triggerAlert('error', 'Failed to load usage log details.');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, BASE_URL, triggerAlert]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshTrigger]);

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

  return (
    <AnalyticsTab 
      logsList={logsList} 
      healthData={healthData} 
      getSparklinePath={getSparklinePath}
      styles={styles} 
    />
  );
}
