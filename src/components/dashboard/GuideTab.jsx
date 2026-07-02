import React from 'react';

export default function GuideTab({ BASE_URL, token, handleCopyToClipboard, copiedId, styles }) {
  return (
    <div className="animate-fade-in" style={{ textAlign: 'left' }}>
      <h2 style={styles.tabTitle}>Developer Integration Guide</h2>
      <p style={styles.tabSubtitle}>
        Integrate Axon's load balancing API gateway into your applications in 3 lines of code.
      </p>

      <div style={styles.guideContainer}>
        <h3>1. Client API Request Specs</h3>
        <p>
          Applications make standard HTTP POST requests to the gateway router endpoint. The gateway intercepts
          the requests, chooses the optimal active Gemini API Key (load balancing across free and paid limits),
          and proxies the request to the Google Gemini API automatically. If key cooldowns or rate limits
          trigger, failovers occur dynamically.
        </p>

        <div style={{ marginTop: '20px' }}>
          <h4 style={{ marginBottom: '8px' }}>cURL Integration Example</h4>
          <pre
            className="glass-container"
            style={{
              padding: '14px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.85rem',
              color: '#94a3b8',
              position: 'relative',
              overflowX: 'auto',
            }}
          >
            {`curl -X POST "${BASE_URL}/api/v1/proxy/chat" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{
    "provider": "gemini",
    "model": "gemini-3.5-flash",
    "prompt": "Hello Gemini!",
    "estimatedTokens": 100
  }'`}
            <button
              onClick={() =>
                handleCopyToClipboard(
                  `curl -X POST "${BASE_URL}/api/v1/proxy/chat" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer ${token}" \\\n  -d '{\n    "provider": "gemini",\n    "model": "gemini-3.5-flash",\n    "prompt": "Hello Gemini!",\n    "estimatedTokens": 100\n  }'`,
                  'curl'
                )
              }
              className="btn btn-secondary"
              style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 8px', fontSize: '0.7rem' }}
            >
              {copiedId === 'curl' ? 'Copied' : 'Copy'}
            </button>
          </pre>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4 style={{ marginBottom: '8px' }}>Node.js Fetch Integration Example</h4>
          <pre
            className="glass-container"
            style={{
              padding: '14px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.85rem',
              color: '#94a3b8',
              position: 'relative',
              overflowX: 'auto',
            }}
          >
            {`const response = await fetch("${BASE_URL}/api/v1/proxy/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${token}"
  },
  body: JSON.stringify({
    "provider": "gemini",
    "model": "gemini-3.5-flash",
    "prompt": "Write a short tagline.",
    "estimatedTokens": 100
  })
});
const data = await response.json();
console.log(data.responseText);`}
            <button
              onClick={() =>
                handleCopyToClipboard(
                  `const response = await fetch("${BASE_URL}/api/v1/proxy/chat", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer ${token}"\n  },\n  body: JSON.stringify({\n    "provider": "gemini",\n    "model": "gemini-3.5-flash",\n    "prompt": "Write a short tagline.",\n    "estimatedTokens": 100\n  })\n});\nconst data = await response.json();\nconsole.log(data.responseText);`,
                  'node'
                )
              }
              className="btn btn-secondary"
              style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 8px', fontSize: '0.7rem' }}
            >
              {copiedId === 'node' ? 'Copied' : 'Copy'}
            </button>
          </pre>
        </div>
      </div>
    </div>
  );
}
