import React from 'react';
import { Plus, Database } from 'lucide-react';

export default function ModelsTab({
  isAdmin,
  modelsList,
  modelSearch,
  setModelSearch,
  modelForm,
  setModelForm,
  showModelForm,
  setShowModelForm,
  isEditingModel,
  setIsEditingModel,
  handleModelSubmit,
  styles,
}) {
  return (
    <div>
      <div style={styles.tabHeader}>
        <div>
          <h2 style={styles.tabTitle}>AI Models</h2>
          <p style={styles.tabSubtitle}>Configure models dynamically tracked by the Axon Router.</p>
        </div>
        {isAdmin && !showModelForm && (
          <button onClick={() => setShowModelForm(true)} className="btn btn-primary">
            <Plus size={16} /> Add Model
          </button>
        )}
      </div>

      {/* Form Inline */}
      {showModelForm && isAdmin && (
        <form onSubmit={handleModelSubmit} style={styles.inlineForm} className="animate-fade-in">
          <h3 style={styles.formTitle}>Add Gemini AI Model</h3>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.formLabel}>Model Name (System ID)</label>
              <input
                type="text"
                required
                className="input-field"
                value={modelForm.name}
                onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                placeholder="e.g. gemini-3.5-flash"
              />
            </div>
            <div>
              <label style={styles.formLabel}>Display Name</label>
              <input
                type="text"
                required
                className="input-field"
                value={modelForm.displayName}
                onChange={(e) => setModelForm({ ...modelForm, displayName: e.target.value })}
                placeholder="e.g. Gemini 3.5 Flash"
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
            <div style={styles.checkboxWrapper}>
              <input
                type="checkbox"
                id="activeModel"
                checked={modelForm.active}
                onChange={(e) => setModelForm({ ...modelForm, active: e.target.checked })}
                style={styles.checkboxInput}
              />
              <label htmlFor="activeModel" style={styles.checkboxLabel}>
                Active / Enabled
              </label>
            </div>
          </div>
          <div style={styles.formActions}>
            <button type="submit" className="btn btn-success">
              Save Model
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowModelForm(false);
                setIsEditingModel(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Row */}
      <div style={{ ...styles.filterRow, marginBottom: '20px' }}>
        <div style={styles.filterGroup}>
          <input
            type="text"
            className="input-field"
            style={styles.searchInput}
            placeholder="Search models by name..."
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Models List Grid */}
      <div style={styles.modelsGrid}>
        {(() => {
          const filteredModels = modelsList.filter((m) => {
            if (
              modelSearch &&
              !m.displayName.toLowerCase().includes(modelSearch.toLowerCase()) &&
              !m.name.toLowerCase().includes(modelSearch.toLowerCase())
            ) {
              return false;
            }
            return true;
          });

          if (filteredModels.length === 0) {
            return (
              <div
                className="glass-container"
                style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#64748b' }}
              >
                No AI models found matching search filters.
              </div>
            );
          }

          return filteredModels.map((m) => (
            <div key={m.id} className="glass-container animate-fade-in" style={styles.modelCard}>
              <div style={styles.modelCardHeader}>
                <div style={styles.modelIconBox}>
                  <Database size={18} color="#a855f7" />
                </div>
                <div>
                  <h4 style={styles.modelTitle}>{m.displayName}</h4>
                  <code style={styles.modelCode}>{m.name}</code>
                </div>
              </div>
              <div style={styles.modelCardBody}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#94a3b8' }}>Provider:</span>
                  <strong style={{ color: '#fff' }}>Google Gemini</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#94a3b8' }}>Priority Index:</span>
                  <strong style={{ color: '#fff' }}>{m.priority || '1'}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#94a3b8' }}>Status:</span>
                  <span className={`badge ${m.active || m.enabled ? 'badge-active' : 'badge-inactive'}`}>
                    {m.active || m.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
