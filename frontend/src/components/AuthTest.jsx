import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const AuthTest = () => {
  const { user, session, getAccessToken } = useAuth();
  const [testResult, setTestResult] = useState('');

  const testAuth = async () => {
    try {
      const token = getAccessToken();
      console.log('Testing with token:', token);
      
      const response = await fetch('http://localhost:3000/api/test-auth', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Success: ${JSON.stringify(data)}`);
      } else {
        setTestResult(`❌ Failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={{padding: '20px', background: '#333', margin: '20px', borderRadius: '8px'}}>
      <h3>Auth Test</h3>
      <div>User: {user ? user.email : 'None'}</div>
      <div>Session: {session ? 'Active' : 'None'}</div>
      <div>Token: {getAccessToken() ? 'Present' : 'Missing'}</div>
      <button onClick={testAuth} style={{margin: '10px 0', padding: '10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px'}}>
        Test API Auth
      </button>
      <div>{testResult}</div>
    </div>
  );
};

export default AuthTest;