/**
 * IP Whitelist Testing Script (TypeScript Version)
 * 
 * This script tests the actual IP whitelist implementation used in production.
 * 
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/test-ip-whitelist.ts
 */

import { ALL_WHITELISTED_IPS, isWhitelisted } from '../server/middlewares/ip-whitelist';

console.log('🔒 Testing IP Whitelist Implementation');
console.log('=====================================');

// Test IPs to verify against the whitelist
const testIps = [
  { ip: '127.0.0.1', description: 'localhost', expected: true },
  { ip: '::1', description: 'localhost IPv6', expected: true },
  { ip: '::ffff:127.0.0.1', description: 'localhost IPv4 mapped to IPv6', expected: true },
  { ip: '192.168.1.100', description: 'private network IP', expected: true },
  { ip: '10.0.0.5', description: 'private network IP (10.x.x.x)', expected: true },
  { ip: '172.16.0.1', description: 'private network IP (172.16-31.x.x)', expected: true },
  { ip: '172.32.0.1', description: 'outside private range', expected: false },
  { ip: '169.254.0.1', description: 'link-local address', expected: true },
  { ip: '10.81.0.123', description: 'Replit internal network', expected: true },
  { ip: '8.8.8.8', description: 'public IP (Google DNS)', expected: false },
];

// Display configured whitelisted IPs
console.log('\n📋 Currently Whitelisted IP Ranges:');
ALL_WHITELISTED_IPS.forEach(ip => {
  console.log(`  - ${ip}`);
});

// Test isWhitelisted function
console.log('\n🧪 Testing IP Addresses:');
console.log('======================');

testIps.forEach(test => {
  const result = isWhitelisted(test.ip);
  const status = result === test.expected ? '✅' : '❌';
  const expectedText = test.expected ? 'should be whitelisted' : 'should NOT be whitelisted';
  
  console.log(`${status} ${test.ip.padEnd(20)} ${test.description.padEnd(30)} ${expectedText}`);
});

// Summary
const passedTests = testIps.filter(test => isWhitelisted(test.ip) === test.expected).length;
const totalTests = testIps.length;

console.log('\n📊 Test Summary:');
console.log(`Passed: ${passedTests}/${totalTests} tests`);

if (passedTests === totalTests) {
  console.log('✅ All IP whitelist tests passed!');
} else {
  console.log('❌ Some tests failed. Check your whitelist configuration.');
}

// Add instructions for adding custom IPs
console.log('\n💡 To add custom IPs to the whitelist:');
console.log('1. Edit server/middlewares/ip-whitelist.ts');
console.log('2. Add your IP to the CUSTOM_WHITELIST array');
console.log('3. Restart the server');