import React, { useState, useEffect } from 'react';

const ConnectionTest = () => {
  const [backendStatus, setBackendStatus] = useState('Testing...');
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    try {
      setBackendStatus('Testing connection...');
      setError(null);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      console.log('Testing API URL:', apiUrl);
      
      const response = await fetch(`${apiUrl}/test`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setApiResponse(data);
      setBackendStatus('✅ Connection Successful!');
      
    } catch (err) {
      console.error('API Test Error:', err);
      setError(err.message);
      setBackendStatus('❌ Connection Failed');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Frontend-Backend Connection Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <p className="text-lg mb-2">{backendStatus}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Frontend URL:</strong><br />
            {import.meta.env.VITE_BASE_URL || 'http://localhost:4000'}
          </div>
          <div>
            <strong>Backend API URL:</strong><br />
            {import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {apiResponse && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <h3 className="font-semibold mb-2">API Response:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}

      <button 
        onClick={testConnection}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Test Connection Again
      </button>
    </div>
  );
};

export default ConnectionTest;
