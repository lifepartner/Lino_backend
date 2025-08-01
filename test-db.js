const mongoose = require('mongoose');

// Test MongoDB connection
async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/lino');
    console.log('✅ MongoDB connected successfully!');
    
    // Check if users collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Check if users collection has data
    const usersCollection = mongoose.connection.db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`👥 Number of users in database: ${userCount}`);
    
    if (userCount > 0) {
      // Show sample user data
      const sampleUser = await usersCollection.findOne();
      console.log('📄 Sample user data:', JSON.stringify(sampleUser, null, 2));
    }
    
    // Test creating a sample user
    const testUser = {
      phone_number: '+1234567890',
      nickname: 'Test User',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      birthday: new Date('1990-01-01'),
      age: 33,
      gender: 'male',
      avatar: 'test-avatar.jpg',
      categories: {
        friendship: true,
        hobby: false,
        consultation: false
      },
      phoneVerified: true,
      isVerified: true,
      verificationAttempts: 0,
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
      onlineStatus: 'online',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await usersCollection.insertOne(testUser);
    console.log('✅ Test user created with ID:', result.insertedId);
    
    // Verify the user was saved
    const savedUser = await usersCollection.findOne({ _id: result.insertedId });
    console.log('✅ User saved successfully:', savedUser ? 'YES' : 'NO');
    
    // Clean up - remove test user
    await usersCollection.deleteOne({ _id: result.insertedId });
    console.log('🧹 Test user cleaned up');
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

testConnection(); 