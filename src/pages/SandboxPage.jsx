import React, { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import SandboxTab from '../components/dashboard/SandboxTab';
import { styles } from '../styles';

export default function SandboxPage() {
  const { token, BASE_URL } = useOutletContext();

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
  const [selectedChatMsgId, setSelectedChatMsgId] = useState(null);
  const [copiedId, setCopiedId] = useState('');

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

  const handleCopyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
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

  const handleChatSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const promptText = chatInput;
    setChatInput('');
    sendPromptToChatbot(promptText);
  };

  return (
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
  );
}
