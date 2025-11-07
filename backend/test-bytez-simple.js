/**
 * Simple Bytez API connectivity test
 */

const https = require('https');

async function testConnectivity() {
  console.log('=== Testing Bytez API Connectivity ===\n');
  
  const apiKey = process.env.BYTEZ_API_KEY || '8231fe9db7ac20bdf4977f00db9f13b4';
  console.log(`API Key: ${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`);
  console.log('');
  
  // Test 1: DNS Resolution
  console.log('1. Testing DNS resolution for api.bytez.com...');
  const dns = require('dns').promises;
  try {
    const addresses = await dns.resolve4('api.bytez.com');
    console.log(`   ✅ DNS resolved: ${addresses.join(', ')}`);
  } catch (error) {
    console.error(`   ❌ DNS resolution failed: ${error.message}`);
    return;
  }
  console.log('');
  
  // Test 2: Basic HTTPS connectivity
  console.log('2. Testing HTTPS connectivity to api.bytez.com...');
  try {
    await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.bytez.com',
        port: 443,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        console.log(`   ✅ Connected! Status: ${res.statusCode}`);
        resolve();
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Connection timeout')));
      req.end();
    });
  } catch (error) {
    console.error(`   ❌ Connection failed: ${error.message}`);
    return;
  }
  console.log('');
  
  // Test 3: Try using Bytez SDK
  console.log('3. Testing Bytez SDK initialization...');
  try {
    const Bytez = require('bytez.js').default || require('bytez.js');
    const sdk = new Bytez(apiKey);
    console.log('   ✅ SDK initialized');
    
    // Don't actually run the model, just create it
    const model = sdk.model('facebook/musicgen-melody-large');
    console.log('   ✅ Model object created');
  } catch (error) {
    console.error(`   ❌ SDK error: ${error.message}`);
  }
  
  console.log('\n=== Diagnostic Complete ===');
  console.log('\nIf DNS and HTTPS connection succeeded but audio generation still fails,');
  console.log('the issue might be:');
  console.log('  - Bytez API is temporarily down');
  console.log('  - The API key is invalid');
  console.log('  - The specific model endpoint is having issues');
  console.log('  - Server firewall is blocking certain requests');
}

testConnectivity().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});


