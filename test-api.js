// Simple API test script to debug deployment issues
const axios = require('axios');

const BASE_URL = 'https://your-app-name.onrender.com'; // Replace with your actual URL

async function testAPI() {
    console.log('🧪 Testing API endpoints...\n');
    
    try {
        // Test 1: Basic server response
        console.log('1️⃣ Testing basic server response...');
        const testResponse = await axios.get(`${BASE_URL}/test`);
        console.log('✅ /test endpoint working:', testResponse.data);
    } catch (error) {
        console.log('❌ /test endpoint failed:', error.response?.status, error.response?.statusText);
    }
    
    try {
        // Test 2: Health check
        console.log('\n2️⃣ Testing health check...');
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ /api/health endpoint working:', healthResponse.data);
    } catch (error) {
        console.log('❌ /api/health endpoint failed:', error.response?.status, error.response?.statusText);
    }
    
    try {
        // Test 3: Root endpoint
        console.log('\n3️⃣ Testing root endpoint...');
        const rootResponse = await axios.get(`${BASE_URL}/`);
        console.log('✅ Root endpoint working:', rootResponse.data);
    } catch (error) {
        console.log('❌ Root endpoint failed:', error.response?.status, error.response?.statusText);
    }
    
    try {
        // Test 4: Auth endpoint (should fail with 401, not 502)
        console.log('\n4️⃣ Testing auth endpoint...');
        const authResponse = await axios.get(`${BASE_URL}/api/auth/me`);
        console.log('✅ /api/auth/me endpoint working:', authResponse.data);
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ /api/auth/me endpoint working (401 expected for unauthenticated user)');
        } else {
            console.log('❌ /api/auth/me endpoint failed:', error.response?.status, error.response?.statusText);
        }
    }
    
    console.log('\n🎯 Test completed!');
}

// Run the test
testAPI().catch(console.error);


