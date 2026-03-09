import { useState, useEffect } from 'react';
import { authAPI } from './api';

export default function DiagnosticsPage() {
  const [backendStatus, setBackendStatus] = useState('Testing...');
  const [supabaseStatus, setSupabaseStatus] = useState('Unknown');
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  };

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    addLog('Starting diagnostics...', 'info');
    
    // Test backend health
    try {
      addLog('Testing backend health endpoint...', 'info');
      const result = await authAPI.testConnection();
      if (result.connected) {
        addLog('✓ Backend is reachable (HTTP ' + result.status + ')', 'success');
        setBackendStatus('✓ Connected');
      } else {
        addLog('✗ Backend health check failed: ' + result.error, 'error');
        setBackendStatus('✗ Unreachable');
      }
    } catch (error) {
      addLog('✗ Backend connection error: ' + error.message, 'error');
      setBackendStatus('✗ Error');
    }
  };

  const testRegister = async () => {
    const testEmail = `test-${Date.now()}@example.com`;
    addLog(`Testing register with email: ${testEmail}`, 'info');
    
    try {
      const result = await authAPI.register('Test User', testEmail, 'password123');
      addLog('✓ Register successful - received token: ' + result.token?.substring(0, 20) + '...', 'success');
      addLog('✓ User data: ' + JSON.stringify(result), 'success');
      setSupabaseStatus('✓ Data saved to Supabase');
    } catch (error) {
      addLog('✗ Register failed: ' + error.message, 'error');
      setSupabaseStatus('✗ Failed');
    }
  };

  const testLogin = async () => {
    addLog('Testing login...', 'info');
    try {
      const result = await authAPI.login('test@example.com', 'password123');
      addLog('✓ Login successful - received token', 'success');
      addLog('✓ User data: ' + JSON.stringify(result), 'success');
    } catch (error) {
      addLog('✗ Login failed: ' + error.message, 'error');
    }
  };

  const checkLocalStorage = () => {
    addLog('Checking localStorage...', 'info');
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token) {
      addLog('✓ Token found: ' + token.substring(0, 20) + '...', 'success');
    } else {
      addLog('✗ No token in localStorage', 'warn');
    }
    
    if (user) {
      addLog('✓ User data: ' + user, 'success');
    } else {
      addLog('✗ No user data in localStorage', 'warn');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared', 'info');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#1e1e1e', color: '#00ff00', minHeight: '100vh' }}>
      <h1>🔧 Backend Diagnostics</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
        <div>
          <strong>Backend Status:</strong> {backendStatus}
        </div>
        <div>
          <strong>Supabase Status:</strong> {supabaseStatus}
        </div>
        <div>
          <strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={testConnection} style={buttonStyle}>
          🔄 Test Backend Connection
        </button>
        <button onClick={testRegister} style={buttonStyle}>
          📝 Test Register
        </button>
        <button onClick={testLogin} style={buttonStyle}>
          🔑 Test Login
        </button>
        <button onClick={checkLocalStorage} style={buttonStyle}>
          💾 Check LocalStorage
        </button>
        <button onClick={clearLogs} style={buttonStyle}>
          🗑️ Clear Logs
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#000', 
        padding: '15px', 
        borderRadius: '5px',
        maxHeight: '400px',
        overflowY: 'auto',
        border: '2px solid #00ff00'
      }}>
        <h3>📋 Logs:</h3>
        {logs.length === 0 ? (
          <div style={{ color: '#666' }}>No logs yet. Click a button to start testing.</div>
        ) : (
          logs.map((log, idx) => (
            <div 
              key={idx}
              style={{
                color: log.type === 'error' ? '#ff4444' : log.type === 'success' ? '#44ff44' : log.type === 'warn' ? '#ffaa00' : '#00ff00',
                marginBottom: '5px',
                fontSize: '12px'
              }}
            >
              [{log.timestamp}] {log.message}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>💡 Tip: Open browser DevTools (F12) and check the Console tab for detailed logs.</p>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '10px 15px',
  backgroundColor: '#0066ff',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  fontFamily: 'monospace',
  transition: 'background-color 0.3s'
};
