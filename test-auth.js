const axios = require('axios');

// Test authentication flow
async function testAuth() {
  const baseURL = 'http://localhost:2920/api';
  
  try {
    console.log('Testing authentication flow...\n');
    
    // 1. Test SMS sending
    console.log('1. Testing SMS sending...');
    const smsResponse = await axios.post(`${baseURL}/user/send-sms`, {
      phone_number: '+1234567890'
    });
    console.log('SMS response:', smsResponse.data);
    
    // 2. Test SMS verification (this should return tokens)
    console.log('\n2. Testing SMS verification...');
    const verifyResponse = await axios.post(`${baseURL}/user/verify-sms`, {
      phone_number: '+1234567890',
      verification_code: '123456',
      isTesting: true
    });
    console.log('Verify response:', verifyResponse.data);
    
    if (verifyResponse.data.tokens) {
      const { accessToken, refreshToken } = verifyResponse.data.tokens;
      
      // 3. Test protected endpoint with access token
      console.log('\n3. Testing protected endpoint...');
      const protectedResponse = await axios.get(`${baseURL}/user/check-login`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log('Protected endpoint response:', protectedResponse.data);
      
      // 4. Test token refresh
      console.log('\n4. Testing token refresh...');
      const refreshResponse = await axios.post(`${baseURL}/user/refresh-token`, {
        refreshToken: refreshToken
      });
      console.log('Refresh response:', refreshResponse.data);
      
    } else {
      console.log('No tokens received from verification');
    }
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

// Test upload endpoint
async function testUpload() {
  const baseURL = 'http://localhost:2920/api';
  
  try {
    console.log('\nTesting upload endpoint...\n');
    
    // First get a valid token
    const verifyResponse = await axios.post(`${baseURL}/user/verify-sms`, {
      phone_number: '+1234567890',
      verification_code: '123456',
      isTesting: true
    });
    
    if (verifyResponse.data.tokens) {
      const { accessToken } = verifyResponse.data.tokens;
      const userId = verifyResponse.data.user.id;
      
      console.log('Testing upload with token:', accessToken ? 'present' : 'missing');
      console.log('User ID:', userId);
      
      // Test upload endpoint
      const uploadResponse = await axios.get(`${baseURL}/upload/avatar/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log('Upload endpoint response:', uploadResponse.data);
      
    } else {
      console.log('No tokens received for upload test');
    }
    
  } catch (error) {
    console.error('Upload test failed:', error.response?.data || error.message);
  }
}

// Run tests
testAuth().then(() => {
  return testUpload();
}).catch(console.error); 