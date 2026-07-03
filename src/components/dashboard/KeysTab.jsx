import React from 'react';
import { Plus, Edit2, Power, Zap, Flame, Trash2 } from 'lucide-react';

export default function KeysTab({
  isAdmin,
  keysList,
  keySearch,
  setKeySearch,
  keyStatusFilter,
  setKeyStatusFilter,
  keySortField,
  setKeySortField,
  keySortOrder,
  setKeySortOrder,
  keyForm,
  setKeyForm,
  isEditingKey,
  setIsEditingKey,
  showKeyForm,
  setShowKeyForm,
  handleKeySubmit,
  handleEditKeyClick,
  handleToggleKeyActive,
  handleClearCooldown,
  handleTriggerCooldown,
  handleDeleteKey,
  handleActivateAllKeys,
  styles,
}) {
  return (
    <div>
      <div style={styles.tabHeader}>
        <div>
          <h2 style={styles.tabTitle}>API Key Pool</h2>
          <p style={styles.tabSubtitle}>Manage Gemini tokens, limits, concurrency, and overrides.</p>
        </div>
        {isAdmin && !showKeyForm && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleActivateAllKeys} 
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'rgba(52, 211, 153, 0.06)', border: '1px solid rgba(52, 211, 153, 0.25)', color: '#34d399' }}
              title="Activate all API keys in pool"
            >
              <Power size={15} /> Activate All Keys
            </button>
            <button onClick={() => setShowKeyForm(true)} className="btn btn-primary">
              <Plus size={16} /> New Key
            </button>
          </div>
        )}
      </div>

      {/* Form Inline */}
      {showKeyForm && isAdmin && (
        <form onSubmit={handleKeySubmit} style={styles.inlineForm} className="animate-fade-in">
          <h3 style={styles.formTitle}>{isEditingKey ? 'Modify API Key' : 'Add Gemini API Key'}</h3>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.formLabel}>Friendly Name</label>
              <input
                type="text"
                required
                className="input-field"
                value={keyForm.name}
                onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                placeholder="e.g. Gemini Production Key 1"
              />
            </div>
            <div>
              <label style={styles.formLabel}>Provider</label>
              <div
                style={{
                  padding: '11px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#94a3b8',
                }}
              >
                Google Gemini (Locked)
              </div>
            </div>
            <div>
              <label style={styles.formLabel}>API Key Value</label>
              <input
                type="password"
                required={!isEditingKey}
                className="input-field"
                value={keyForm.keyValue}
                onChange={(e) => setKeyForm({ ...keyForm, keyValue: e.target.value })}
                placeholder={isEditingKey ? 'Leave blank to keep same' : 'AIzaSy...'}
              />
            </div>
            <div>
              <label style={styles.formLabel}>Supported Models (comma-separated)</label>
              <input
                type="text"
                className="input-field"
                value={keyForm.models}
                onChange={(e) => setKeyForm({ ...keyForm, models: e.target.value })}
                placeholder="e.g. gemini-3.5-flash, gemini-2.5-flash"
              />
            </div>
            <div>
              <label style={styles.formLabel}>Requests Per Min (RPM)</label>
              <input
                type="number"
                className="input-field"
                value={keyForm.limitRpm}
                onChange={(e) => setKeyForm({ ...keyForm, limitRpm: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label style={styles.formLabel}>Tokens Per Min (TPM)</label>
              <input
                type="number"
                className="input-field"
                value={keyForm.limitTpm}
                onChange={(e) => setKeyForm({ ...keyForm, limitTpm: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label style={styles.formLabel}>Cooldown Duration (Sec)</label>
              <input
                type="number"
                className="input-field"
                value={keyForm.cooldownDurationSeconds}
                onChange={(e) =>
                  setKeyForm({ ...keyForm, cooldownDurationSeconds: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div style={styles.checkboxWrapper}>
              <input
                type="checkbox"
                id="activeKey"
                checked={keyForm.active}
                onChange={(e) => setKeyForm({ ...keyForm, active: e.target.checked })}
                style={styles.checkboxInput}
              />
              <label htmlFor="activeKey" style={styles.checkboxLabel}>
                Active / Enabled
              </label>
            </div>
          </div>
          <div style={styles.formActions}>
            <button type="submit" className="btn btn-success">
              Save Key
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowKeyForm(false);
                setIsEditingKey(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Row */}
      <div style={styles.filterRow}>
        <div style={styles.filterGroup}>
          <input
            type="text"
            className="input-field"
            style={styles.searchInput}
            placeholder="Search keys by name..."
            value={keySearch}
            onChange={(e) => setKeySearch(e.target.value)}
          />
          <select
            className="input-field"
            style={styles.filterSelect}
            value={keyStatusFilter}
            onChange={(e) => setKeyStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Eligible / Active</option>
            <option value="cooldown">In Cooldown</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div style={styles.filterGroup}>
          <span style={styles.sortLabel}>Sort By:</span>
          <select
            className="input-field"
            style={styles.filterSelect}
            value={keySortField}
            onChange={(e) => setKeySortField(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="healthScore">Health Score</option>
            <option value="lastUsed">Last Used Time</option>
          </select>
          <button
            type="button"
            className="btn btn-secondary"
            style={styles.sortOrderBtn}
            onClick={() => setKeySortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          >
            {keySortOrder.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>API Key</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Limits (RPM/TPM)</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filtered = keysList
                .filter((k) => {
                  if (keySearch && !k.name.toLowerCase().includes(keySearch.toLowerCase())) return false;
                  if (keyStatusFilter) {
                    if (keyStatusFilter === 'active' && (!k.active || k.status !== 'ACTIVE')) return false;
                    if (keyStatusFilter === 'cooldown' && k.status !== 'COOLDOWN') return false;
                    if (keyStatusFilter === 'inactive' && k.active) return false;
                  }
                  return true;
                })
                .sort((a, b) => {
                  let factor = keySortOrder === 'asc' ? 1 : -1;
                  if (keySortField === 'name') return a.name.localeCompare(b.name) * factor;
                  if (keySortField === 'healthScore') return ((a.healthScore || 1.0) - (b.healthScore || 1.0)) * factor;
                  if (keySortField === 'lastUsed') return ((a.lastUsed || 0) - (b.lastUsed || 0)) * factor;
                  return 0;
                });

              if (filtered.length === 0) {
                return (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                      No keys found matching filter criteria.
                    </td>
                  </tr>
                );
              }

              return filtered.map((k) => {
                const maskedKey = k.keyValue || k.apiKey || '******';
                const isKeyCooldown = k.status === 'COOLDOWN';

                return (
                  <tr key={k.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 'bold', color: '#fff' }}>{k.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', wordBreak: 'break-all' }}>{k.id}</div>
                    </td>
                    <td style={styles.td}>
                      <code style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{maskedKey}</code>
                    </td>
                    <td style={styles.td}>
                      <span
                        className={`badge ${
                          k.active && k.status === 'ACTIVE'
                            ? 'badge-active'
                            : isKeyCooldown
                            ? 'badge-cooldown'
                            : 'badge-inactive'
                        }`}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            marginRight: '6px',
                            background:
                              k.active && k.status === 'ACTIVE'
                                ? '#34d399'
                                : isKeyCooldown
                                ? '#fbbf24'
                                : '#94a3b8',
                          }}
                        />
                        {k.status || (k.active ? 'ACTIVE' : 'DISABLED')}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: '0.82rem' }}>{k.limitRpm} RPM</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {k.limitTpm.toLocaleString()} TPM
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEditKeyClick(k)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 8px' }}
                          title="Edit Key"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleToggleKeyActive(k)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 8px', color: k.active ? '#ef4444' : '#10b981' }}
                          title={k.active ? 'Disable Key' : 'Enable Key'}
                        >
                          <Power size={13} />
                        </button>
                        {isKeyCooldown ? (
                          <button
                            onClick={() => handleClearCooldown(k.id)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 8px', color: '#10b981' }}
                            title="Reset Cooldown"
                          >
                            <Zap size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTriggerCooldown(k.id)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 8px', color: '#f59e0b' }}
                            title="Force Cooldown"
                          >
                            <Flame size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteKey(k.id)}
                          className="btn btn-danger"
                          style={{ padding: '6px 8px' }}
                          title="Delete Key"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
