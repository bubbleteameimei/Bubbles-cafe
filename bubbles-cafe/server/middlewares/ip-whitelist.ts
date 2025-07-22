/**
 * IP Whitelist Configuration
 * 
 * This file contains whitelist configurations for rate limiting and security features.
 * Add custom IPs as needed for development, testing, or trusted services.
 */

// Common development IPs that should bypass rate limiting
export const DEVELOPMENT_IPS = [
  '127.0.0.1',           // localhost
  '::1',                 // localhost IPv6
  '::ffff:127.0.0.1',    // localhost IPv4 mapped to IPv6
  '10.0.0.0/8',          // Private network range
  '172.16.0.0/12',       // Private network range
  '192.168.0.0/16',      // Private network range
  '169.254.0.0/16',      // Link-local addresses
];

// Replit-specific IPs 
export const REPLIT_IPS = [
  '10.81.0.0/16',        // Replit internal network
];

// Trusted external services that should have higher rate limits
export const TRUSTED_SERVICES = [
  // Add trusted service IPs here as needed
  // Example: '34.123.456.78',  // API integration partner
];

// Custom whitelist for specific users/clients
export const CUSTOM_WHITELIST = [
  // Add custom IPs here as needed during development
  // Example: '203.0.113.42',  // Developer's home IP
];

// Combined whitelist for convenience
export const ALL_WHITELISTED_IPS = [
  ...DEVELOPMENT_IPS,
  ...REPLIT_IPS,
  ...TRUSTED_SERVICES,
  ...CUSTOM_WHITELIST
];

// Function to check if an IP is in any of the whitelists
export function isWhitelisted(ip: string): boolean {
  // Direct IP match
  if (ALL_WHITELISTED_IPS.includes(ip)) {
    return true;
  }
  
  // CIDR matching
  for (const cidr of ALL_WHITELISTED_IPS) {
    if (cidr.includes('/')) {
      const [subnet, bits] = cidr.split('/');
      const ipInCidr = isIpInCidr(ip, subnet, parseInt(bits, 10));
      if (ipInCidr) return true;
    }
  }
  
  return false;
}

// Simple CIDR check for common IP patterns
function isIpInCidr(ip: string, subnet: string, bits: number): boolean {
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
function ipToNum(ip: string): number {
  return ip.split('.').reduce((sum, octet) => (sum << 8) + parseInt(octet, 10), 0) >>> 0;
}