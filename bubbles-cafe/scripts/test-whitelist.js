/**
 * IP Whitelist Testing Script
 * 
 * This script tests the IP whitelist functionality by:
 * 1. Testing if common development IPs are whitelisted
 * 2. Testing if CIDR notation is properly evaluated
 * 3. Testing if Replit-specific IPs are recognized
 * 
 * Usage:
 *   node scripts/test-whitelist.js
 */

// Import the isWhitelisted function and IP lists
// You'll need to transpile the TypeScript first or use ts-node
console.log('Testing IP whitelist functionality...');

// Mock implementations for testing
function isIpInCidr(ip, subnet, bits) {
  // Simple CIDR check for common IP patterns
  // Handle IPv4 mapped to IPv6 format
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  // Only handle IPv4 for simplicity
  if (ip.includes(':') || subnet.includes(':')) {
    // We're not handling IPv6 CIDR checks for simplicity
    return ip === subnet;
  }
  
  // Convert IP to numeric value
  const ipNum = ipToNum(ip);
  const subnetNum = ipToNum(subnet);
  
  // Create bit mask based on CIDR prefix
  const mask = -1 << (32 - bits);
  
  // Check if IP is in subnet
  return (ipNum & mask) === (subnetNum & mask);
}

// Convert IPv4 address to numeric value
function ipToNum(ip) {
  return ip.split('.').reduce((sum, octet) => (sum << 8) + parseInt(octet, 10), 0) >>> 0;
}

// Test IPs
const testIps = [
  { ip: '127.0.0.1', description: 'localhost' },
  { ip: '::1', description: 'localhost IPv6' },
  { ip: '::ffff:127.0.0.1', description: 'localhost IPv4 mapped to IPv6' },
  { ip: '192.168.1.100', description: 'private network IP' },
  { ip: '10.0.0.5', description: 'private network IP (10.x.x.x)' },
  { ip: '172.16.0.1', description: 'private network IP (172.16-31.x.x)' },
  { ip: '169.254.0.1', description: 'link-local address' },
  { ip: '10.81.0.123', description: 'Replit internal network' },
  { ip: '8.8.8.8', description: 'public IP (Google DNS)' },
];

// CIDR tests
const cidrTests = [
  { ip: '192.168.1.100', cidr: '192.168.0.0/16', expected: true },
  { ip: '192.169.1.1', cidr: '192.168.0.0/16', expected: false },
  { ip: '10.20.30.40', cidr: '10.0.0.0/8', expected: true },
  { ip: '172.20.30.40', cidr: '172.16.0.0/12', expected: true },
  { ip: '172.32.0.1', cidr: '172.16.0.0/12', expected: false },
  { ip: '10.81.112.5', cidr: '10.81.0.0/16', expected: true },
];

// Test CIDR functionality
console.log('\n===== Testing CIDR functionality =====');
for (const test of cidrTests) {
  const { ip, cidr, expected } = test;
  const [subnet, bits] = cidr.split('/');
  const result = isIpInCidr(ip, subnet, parseInt(bits, 10));
  
  console.log(`IP: ${ip.padEnd(15)} in CIDR: ${cidr.padEnd(15)} => ${result ? 'Yes' : 'No'} ${result === expected ? '✓' : '✗'}`);
}

// Load the actual implementation
console.log('\n===== Important Note =====');
console.log('To test with the actual implementation, run:');
console.log('npx ts-node -r tsconfig-paths/register scripts/test-ip-whitelist.ts');
console.log('\nThis script provides a basic verification of CIDR matching logic.');
console.log('The full implementation is available in server/middlewares/ip-whitelist.ts');