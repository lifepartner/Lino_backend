const axios = require('axios');

const BASE_URL = 'http://localhost:2920';

async function testCompleteProfile() {
  try {
    console.log('🧪 Testing completeProfile API...');
    
    const testData = {
      phone_number: '+81123456789',
      nickname: 'TestUser',
      first_name: 'Test',
      last_name: 'User',
      first_name_kana: 'テスト',
      last_name_kana: 'ユーザー',
      birthday: new Date('1990-01-01'),
      gender: 'male',
      email: 'test@example.com',
      avatar: 'test-avatar.jpg',
      gallery: ['image1.jpg', 'image2.jpg'],
      categories: {
        friendship: true,
        hobby: true,
        consultation: false
      }
    };

    console.log('📤 Sending data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/api/user/complete-profile`, testData);
    
    console.log('✅ Success! Response:', response.data);
    console.log('🎉 User profile should now be saved in database!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCompleteProfile(); 