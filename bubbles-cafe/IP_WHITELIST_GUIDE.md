# IP Whitelist Configuration Guide

This guide explains how to use and configure the IP whitelist system for rate limiting protection during development and testing.

## Overview

Our application uses Express Rate Limiter to protect against potential abuse by limiting the number of requests from individual IP addresses within specific time windows. However, during development and testing, these rate limits can sometimes be too restrictive.

The IP whitelist system allows specific IP addresses to bypass rate limiting entirely while maintaining protection for your production environment.

## How It Works

The system provides several built-in whitelist categories:

1. **Development IPs**: Common local development IPs like 127.0.0.1, localhost, etc.
2. **Replit IPs**: Replit-specific internal network ranges
3. **Trusted Services**: Reserved for external services that need higher rate limits
4. **Custom Whitelist**: User-defined IPs that should bypass rate limiting

Rate limiters check each incoming request to determine if the source IP is on any whitelist. Whitelisted IPs bypass rate limiting entirely.

## Current Rate Limits

| Type                 | Production Limit | Development Limit | Time Window |
|----------------------|------------------|-------------------|-------------|
| Global               | 200 requests     | 1000 requests     | 15 minutes  |
| API                  | 200 requests     | 1000 requests     | 15 minutes  |
| Authentication       | 10 attempts      | 50 attempts       | 1 hour      |
| Sensitive Operations | 5 requests       | 25 requests       | 1 hour      |

Authenticated users automatically receive higher rate limits.

## Adding Your IP to the Whitelist

To add your IP address to the whitelist:

1. Open `server/middlewares/ip-whitelist.ts`
2. Add your IP to the `CUSTOM_WHITELIST` array:

```typescript
export const CUSTOM_WHITELIST = [
  // Add your IP here
  '203.0.113.42',  // Example custom IP
];
```

3. Restart the server

## CIDR Notation Support

The system supports CIDR notation for IP ranges:

- `10.0.0.0/8` - Matches any IP starting with 10
- `192.168.0.0/16` - Matches any IP starting with 192.168
- `172.16.0.0/12` - Matches IPs in the 172.16-31.x.x range

## Testing the Whitelist

We provide two test scripts:

1. Basic JavaScript test: `node scripts/test-whitelist.js`
2. Full implementation test: `npx tsx scripts/test-ip-whitelist.ts`

The second script provides a comprehensive test of the actual implementation used in the application.

## Production Considerations

In production, make sure to:

1. Clear the `CUSTOM_WHITELIST` array of any temporary development IPs
2. Review `TRUSTED_SERVICES` to ensure only legitimate services are listed
3. Consider logging rate limit hits to detect potential abuse patterns

## Troubleshooting

If you're experiencing rate limiting during development:

1. Check your current IP with `curl https://api.ipify.org`
2. Add it to the `CUSTOM_WHITELIST` array
3. If using a VPN or proxy, you may need to add that IP instead
4. Restart the server to apply changes

For more complex scenarios, you can modify `getRequestLimit()` in `rate-limiter.ts` to further increase limits.