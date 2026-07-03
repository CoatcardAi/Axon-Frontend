import React from 'react';
import { Plus, Database, Edit2, Power, Trash2 } from 'lucide-react';

export default function ModelsTab({
  isAdmin,
  modelsList,
  modelSearch,
  setModelSearch,
  modelProviderFilter,
  setModelProviderFilter,
  modelForm,
  setModelForm,
  showModelForm,
  setShowModelForm,
  isEditingModel,
  setIsEditingModel,
  handleModelSubmit,
  handleEditModel,
  handleToggleModelActive,
  handleDeleteModel,
  styles,
}) {
  return (
    <div>
      <div style={styles.tabHeader}>
        <div>
          <h2 style={styles.tabTitle}>AI Models</h2>
          <p style={styles.tabSubtitle}>Manage models supported by Axon Router.</p>
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
          <h3 style={styles.formTitle}>{isEditingModel ? 'Modify Model' : 'Register AI Model'}</h3>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.formLabel}>Model Name / ID</label>
              <input
                type="text"
                required
                className="input-field"
                value={modelForm.name}
                onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                placeholder="e.g. gpt-4o"
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
                placeholder="e.g. GPT-4o Flagship"
              />
            </div>
            <div>
              <label style={styles.formLabel}>Provider</label>
              <select
                className="input-field"
                value={modelForm.provider}
                onChange={(e) => setModelForm({ ...modelForm, provider: e.target.value })}
                style={styles.selectStyle}
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="gemini">Google Gemini</option>
                <option value="cohere">Cohere</option>
              </select>
            </div>
            <div>
              <label style={styles.formLabel}>Priority</label>
              <input
                type="number"
                required
                className="input-field"
                value={modelForm.priority}
                onChange={(e) => setModelForm({ ...modelForm, priority: parseInt(e.target.value) || 0 })}
                placeholder="e.g. 1"
              />
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
                setModelForm({ id: '', provider: 'openai', name: '', displayName: '', active: true, priority: 1 });
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
          <select
            className="input-field"
            style={styles.filterSelect}
            value={modelProviderFilter}
            onChange={(e) => setModelProviderFilter(e.target.value)}
          >
            <option value="">All Providers</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Google Gemini</option>
            <option value="cohere">Cohere</option>
          </select>
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
            if (modelProviderFilter && m.provider !== modelProviderFilter) {
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
                No AI models found matching search or provider filters.
              </div>
            );
          }

          return filteredModels.map((m) => {
            const providerClass = m.provider ? m.provider.toLowerCase() : 'default';
            const providerBadgeClass = `provider-pill provider-${providerClass}`;
            const cardPremiumClass = `glass-container model-card-premium model-card-${providerClass} animate-fade-in`;

            return (
              <div key={m.id} className={cardPremiumClass}>
                {/* Card Header Row */}
                <div className="model-header-row">
                  <span className={providerBadgeClass}>
                    {m.provider ? m.provider.toUpperCase() : 'UNKNOWN'}
                  </span>
                  {m.active || m.enabled ? (
                    <span className="badge badge-active">Active</span>
                  ) : (
                    <span className="badge badge-inactive">Disabled</span>
                  )}
                </div>

                {/* Card Main Info */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={styles.modelIconBox}>
                    <Database size={18} color={m.provider === 'gemini' ? '#a855f7' : '#94a3b8'} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 className="model-title-text" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.displayName}
                    </h3>
                    <div style={{ marginTop: '6px' }}>
                      <code className="model-id-code">{m.name}</code>
                    </div>
                  </div>
                </div>

                {/* Priority Row */}
                <div className="model-meta-row">
                  <span className="model-meta-label">Routing Priority:</span>
                  <span className="model-meta-value">{m.priority !== undefined ? m.priority : 0}</span>
                </div>

                {/* Admin Actions Footer */}
                {isAdmin && (
                  <div className="model-actions-footer-premium">
                    <button
                      onClick={() => handleEditModel(m)}
                      className="btn-action btn-action-edit"
                      title="Edit model settings"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleToggleModelActive(m)}
                      className={`btn-action ${m.active ? 'btn-action-disable' : 'btn-action-enable'}`}
                      title={m.active ? 'Disable model' : 'Enable model'}
                    >
                      <Power size={13} />
                      <span>{m.active ? 'Disable' : 'Enable'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteModel(m.id)}
                      className="btn-action btn-action-delete"
                      title="Delete model"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

