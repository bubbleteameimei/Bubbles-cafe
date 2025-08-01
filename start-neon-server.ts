#!/usr/bin/env tsx
import { setNeonAsDefault } from './server/neon-config';

// Set Neon database as default before any other imports
setNeonAsDefault();

// Force the DATABASE_URL to your Neon database
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_P6ghCZR2BASQ@ep-young-bread-aeojmse9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log('🚀 Starting Interactive Storytelling Platform with Neon Database');
console.log('📍 Database URL:', process.env.DATABASE_URL.substring(0, 50) + '...');
console.log('🌐 Server will be available at: http://0.0.0.0:3002');

// Now import and start the server
import('./server/index.js');