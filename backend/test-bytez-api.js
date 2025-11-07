/**
 * Test Bytez API connectivity and model availability
 */

// Check if node-fetch is available (for older Node versions)
const nodeFetch = (() => {
  try {
    return require('node-fetch');
  } catch (e) {
    return null;
  }
})();

const fetch = nodeFetch || global.fetch;

async function testBytezAPI() {
  console.log('=== Testing Bytez API ===\n');
  
  const apiKey = process.env.BYTEZ_API_KEY || '8231fe9db7ac20bdf4977f00db9f13b4';
  console.log(`1. API Key: ${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`);
  console.log(`   Length: ${apiKey.length} characters\n`);
  
  // Test 1: Direct API call
  console.log('2. Testing direct Bytez API endpoint...');
  try {
    const response = await fetch('https://api.bytez.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ API is reachable`);
      console.log(`   Available models: ${data.length || 'unknown'}\n`);
    } else {
      console.log(`   ❌ API returned error status\n`);
    }
  } catch (error) {
    console.error(`   ❌ Network error: ${error.message}`);
    console.error(`   This suggests a network/connectivity issue\n`);
  }
  
  // Test 2: Using Bytez SDK
  console.log('3. Testing with Bytez SDK...');
  try {
    const Bytez = require('bytez.js').default || require('bytez.js');
    const sdk = new Bytez(apiKey);
    console.log('   ✅ SDK initialized successfully\n');
    
    // Test 3: Try to get the model
    console.log('4. Testing model: facebook/musicgen-melody-large');
    const model = sdk.model('facebook/musicgen-melody-large');
    console.log('   ✅ Model object created\n');
    
    // Test 4: Try a simple generation
    console.log('5. Attempting audio generation...');
    console.log('   This may take a few moments...');
    const { error, output } = await model.run('Moody jazz music with saxophones');
    
    if (error) {
      console.error(`   ❌ Generation error: ${error}`);
      console.error(`   Error type: ${typeof error}`);
      console.error(`   Error details:`, JSON.stringify(error, null, 2));
    } else if (output) {
      console.log(`   ✅ Generation successful!`);
      console.log(`   Output URL: ${output}`);
    } else {
      console.log(`   ⚠️ No error but no output either`);
    }
    
  } catch (error) {
    console.error(`   ❌ SDK error: ${error.message}`);
    console.error(`   Stack:`, error.stack);
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testBytezAPI().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});



