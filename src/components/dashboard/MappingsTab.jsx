import React from 'react';
import { Plus, Key, Database, Trash2 } from 'lucide-react';

export default function MappingsTab({
  isAdmin,
  keysList,
  modelsList,
  mappingsList,
  showMappingForm,
  setShowMappingForm,
  mappingForm,
  setMappingForm,
  handleMappingSubmit,
  handleDeleteMapping,
  styles,
}) {
  return (
    <div>
      <div style={styles.tabHeader}>
        <div>
          <h2 style={styles.tabTitle}>Key-to-Model Mappings</h2>
          <p style={styles.tabSubtitle}>Explicitly route specific API keys to particular AI models.</p>
        </div>
        {isAdmin && !showMappingForm && (
          <button onClick={() => setShowMappingForm(true)} className="btn btn-primary">
            <Plus size={16} /> Link Key & Model
          </button>
        )}
      </div>

      {showMappingForm && (
        <form onSubmit={handleMappingSubmit} style={styles.inlineForm} className="animate-fade-in">
          <h3 style={styles.formTitle}>Link Key & Model</h3>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.formLabel}>API Key</label>
              <select
                required
                className="input-field"
                style={styles.selectStyle}
                value={mappingForm.keyId}
                onChange={(e) => setMappingForm({ ...mappingForm, keyId: e.target.value })}
              >
                <option value="">Select Key...</option>
                {keysList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} ({k.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.formLabel}>AI Model</label>
              <select
                required
                className="input-field"
                style={styles.selectStyle}
                value={mappingForm.modelId}
                onChange={(e) => setMappingForm({ ...mappingForm, modelId: e.target.value })}
              >
                <option value="">Select Model...</option>
                {modelsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName} ({m.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={styles.formActions}>
            <button type="submit" className="btn btn-success">
              Create Link
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowMappingForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={styles.mappingsList}>
        {mappingsList.length === 0 ? (
          <div className="glass-container" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No manual mappings linked. System uses wildcard key matching based on key capabilities.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mappingsList.map((m) => {
              const matchedKey = keysList.find((k) => k.id === m.keyId);
              const matchedModel = modelsList.find((mo) => mo.id === m.modelId);

              return (
                <div key={m.id} className="glass-container" style={styles.mappingRow}>
                  <div style={styles.mappingEntity}>
                    <Key size={16} color="#a855f7" />
                    <div>
                      <strong>{matchedKey ? matchedKey.name : 'Unknown Key'}</strong>
                      <code style={{ fontSize: '0.72rem', display: 'block', color: '#64748b' }}>{m.keyId}</code>
                    </div>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '1.2rem' }}>➔</div>
                  <div style={styles.mappingEntity}>
                    <Database size={16} color="#3b82f6" />
                    <div>
                      <strong>{matchedModel ? matchedModel.displayName : 'Unknown Model'}</strong>
                      <code style={{ fontSize: '0.72rem', display: 'block', color: '#64748b' }}>
                        {matchedModel ? matchedModel.name : m.modelId}
                      </code>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDeleteMapping(m.id)}
                      className="btn btn-danger"
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    >
                      <Trash2 size={13} />
                      <span>Delete Link</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
