// Quick test to check favicon API
import fetch from 'node-fetch';

async function testFaviconAPI() {
  try {
    console.log('Testing favicon API endpoint...');
    
    const response = await fetch('http://localhost:4000/api/favicon');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('Error response:', error);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testFaviconAPI();
