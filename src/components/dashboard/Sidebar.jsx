import React from 'react';
import { NavLink } from 'react-router-dom';
import { Key, Database, Link2, Clock, FileText, MessageSquare, User } from 'lucide-react';

export default function Sidebar({ isAdmin, styles }) {
  const getLinkStyle = ({ isActive }) => (isActive ? styles.sidebarBtnActive : styles.sidebarBtn);

  return (
    <aside className="glass-container" style={styles.sidebar}>
      {isAdmin ? (
        <>
          <NavLink to="/keys" style={getLinkStyle}>
            <Key size={18} />
            <span>API Keys</span>
          </NavLink>

          <NavLink to="/models" style={getLinkStyle}>
            <Database size={18} />
            <span>AI Models</span>
          </NavLink>

          <NavLink to="/mappings" style={getLinkStyle}>
            <Link2 size={18} />
            <span>Mappings</span>
          </NavLink>

          <NavLink to="/analytics" style={getLinkStyle}>
            <Clock size={18} />
            <span>Analytics</span>
          </NavLink>

          <NavLink to="/logs" style={getLinkStyle}>
            <FileText size={18} />
            <span>Logs</span>
          </NavLink>

          <NavLink to="/sandbox" style={getLinkStyle}>
            <MessageSquare size={18} />
            <span>Gemini Chatbot</span>
          </NavLink>

          <NavLink to="/profile" style={getLinkStyle}>
            <User size={18} />
            <span>Profile & Security</span>
          </NavLink>
        </>
      ) : (
        <>
          <NavLink to="/sandbox" style={getLinkStyle}>
            <MessageSquare size={18} />
            <span>Gemini Chatbot</span>
          </NavLink>

          <NavLink to="/guide" style={getLinkStyle}>
            <FileText size={18} />
            <span>Developer Guide</span>
          </NavLink>

          <NavLink to="/profile" style={getLinkStyle}>
            <User size={18} />
            <span>Profile & Security</span>
          </NavLink>
        </>
      )}
    </aside>
  );
}
