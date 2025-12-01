// API test script for AI Website Builder
const axios = require('axios');

async function testAPI() {
    console.log('Testing AI Website Builder API endpoints...\n');
    
    try {
        // Test /status endpoint
        console.log('1. Testing /status endpoint...');
        const statusResponse = await axios.get('http://localhost:3000/status');
        console.log('   ✅ Status endpoint working');
        console.log(`   Version: ${statusResponse.data.version}`);
        console.log(`   Status: ${statusResponse.data.status}`);
        console.log(`   Features: ${statusResponse.data.features.length} available\n`);
        
        // Test /analyze endpoint
        console.log('2. Testing /analyze endpoint...');
        const analyzeResponse = await axios.post('http://localhost:3000/analyze', {
            prompt: 'A responsive portfolio website with contact form'
        });
        console.log('   ✅ Analyze endpoint working');
        console.log(`   Type: ${analyzeResponse.data.analysis.type}`);
        console.log(`   Features: ${analyzeResponse.data.analysis.features.join(', ')}\n`);
        
        // Test invalid prompt to /analyze
        console.log('3. Testing error handling...');
        try {
            await axios.post('http://localhost:3000/analyze', {
                prompt: '' // Empty prompt should cause error
            });
            console.log('   ❌ Error handling not working properly');
        } catch (error) {
            console.log('   ✅ Error handling working (received expected error)');
        }
        
        console.log('\n🎉 All API tests passed!');
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testAPI();