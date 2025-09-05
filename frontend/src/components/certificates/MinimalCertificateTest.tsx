import React from 'react';

const MinimalCertificateTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f8ff', border: '2px solid #007bff', borderRadius: '8px', margin: '20px' }}>
      <h1 style={{ color: '#007bff', fontSize: '24px', marginBottom: '16px' }}>
        🎉 SUCCESS! Certificate Page Loaded!
      </h1>
      <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '4px', border: '1px solid #c3e6cb' }}>
        <p style={{ color: '#155724', fontSize: '16px', margin: '0' }}>
          ✅ The routing is working correctly!
        </p>
        <p style={{ color: '#155724', fontSize: '14px', margin: '8px 0 0 0' }}>
          URL: {window.location.pathname}
        </p>
        <p style={{ color: '#155724', fontSize: '14px', margin: '4px 0 0 0' }}>
          Time: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default MinimalCertificateTest;
