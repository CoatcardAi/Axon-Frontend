import React from 'react';
import { Key, Database, Link2, Clock, FileText, MessageSquare } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isAdmin, styles }) {
  return (
    <aside className="glass-container" style={styles.sidebar}>
      {isAdmin ? (
        <>
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
            onClick={() => setActiveTab('mappings')}
            style={activeTab === 'mappings' ? styles.sidebarBtnActive : styles.sidebarBtn}
          >
            <Link2 size={18} />
            <span>Mappings</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            style={activeTab === 'analytics' ? styles.sidebarBtnActive : styles.sidebarBtn}
          >
            <Clock size={18} />
            <span>Analytics</span>
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
            <MessageSquare size={18} />
            <span>Gemini Chatbot</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            style={activeTab === 'profile' ? styles.sidebarBtnActive : styles.sidebarBtn}
          >
            <Key size={18} />
            <span>Profile & Security</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setActiveTab('sandbox')}
            style={activeTab === 'sandbox' ? styles.sidebarBtnActive : styles.sidebarBtn}
          >
            <MessageSquare size={18} />
            <span>Gemini Chatbot</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            style={activeTab === 'guide' ? styles.sidebarBtnActive : styles.sidebarBtn}
          >
            <FileText size={18} />
            <span>Developer Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            style={activeTab === 'profile' ? styles.sidebarBtnActive : styles.sidebarBtn}
          >
            <Key size={18} />
            <span>Profile & Security</span>
          </button>
        </>
      )}
    </aside>
  );
}
