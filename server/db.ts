import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Always use your Neon database as the primary database
const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_P6ghCZR2BASQ@ep-young-bread-aeojmse9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Use your Neon database URL as the primary, with fallback to environment variable
const databaseUrl = process.env.DATABASE_URL?.includes('neon.tech') 
  ? process.env.DATABASE_URL 
  : NEON_DATABASE_URL;

console.log('🔗 Using Neon database:', databaseUrl.includes('neon.tech') ? 'Connected to your Neon database' : 'Using environment DATABASE_URL');

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });