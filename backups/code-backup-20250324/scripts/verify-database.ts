/**
 * Database Verification Utility
 * 
 * This script verifies that your database connection is working
 * and that essential tables and data are accessible.
 * Use this after migrating your database to Render to confirm
 * that everything is working correctly.
 */

import { sql } from 'drizzle-orm';
import { db } from '../server/db';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface TableInfo {
  tableName: string;
  count: number;
}

async function verifyDatabase() {
  console.log('Starting database verification...');
  console.log('--------------------------------');
  
  try {
    // Check database connection
    console.log('1. Testing database connection...');
    
    const connectionInfo = await db.execute(sql`SELECT current_database(), current_user, version()`);
    
    console.log('✅ Database connection successful!');
    console.log(`   Database: ${connectionInfo[0].current_database}`);
    console.log(`   User: ${connectionInfo[0].current_user}`);
    console.log(`   Version: ${connectionInfo[0].version}`);
    
    // Get schema information
    console.log('\n2. Checking database schema...');
    
    const schemaInfo = await db.execute(sql`
      SELECT 
        table_name, 
        column_name,
        data_type
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name, ordinal_position
    `);
    
    const tables = new Set(schemaInfo.map(row => row.table_name));
    console.log(`✅ Found ${tables.size} tables in the database`);
    
    // Check table counts
    console.log('\n3. Checking table record counts...');
    
    const tableCountPromises: Promise<TableInfo>[] = [];
    
    for (const tableName of tables) {
      tableCountPromises.push(
        db.execute(sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`)
          .then(result => ({
            tableName,
            count: Number(result[0].count)
          }))
          .catch(err => {
            console.error(`   Error counting records in ${tableName}: ${err.message}`);
            return { tableName, count: -1 };
          })
      );
    }
    
    const tableCounts = await Promise.all(tableCountPromises);
    
    // Print table counts
    console.log('Table record counts:');
    tableCounts
      .sort((a, b) => a.tableName.localeCompare(b.tableName))
      .forEach(table => {
        if (table.count >= 0) {
          console.log(`   ${table.tableName.padEnd(24)} ${table.count} records`);
        } else {
          console.log(`   ${table.tableName.padEnd(24)} Error counting records`);
        }
      });
    
    // Check for empty tables that usually shouldn't be empty
    const coreTablesWithNoRecords = tableCounts.filter(t => 
      ['users', 'posts', 'sessions'].includes(t.tableName) && t.count === 0
    );
    
    if (coreTablesWithNoRecords.length > 0) {
      console.log('\n⚠️  Warning: The following core tables have no records:');
      coreTablesWithNoRecords.forEach(t => console.log(`   - ${t.tableName}`));
      console.log('   This might indicate issues with the database migration.');
    }
    
    console.log('\n4. Verifying database constraints...');
    
    const constraintInfo = await db.execute(sql`
      SELECT 
        tc.constraint_name, 
        tc.constraint_type,
        tc.table_name,
        kcu.column_name
      FROM 
        information_schema.table_constraints tc
      JOIN 
        information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE 
        tc.table_schema = 'public'
      ORDER BY 
        tc.table_name, tc.constraint_name
    `);
    
    const primaryKeys = constraintInfo.filter(c => c.constraint_type === 'PRIMARY KEY');
    const foreignKeys = constraintInfo.filter(c => c.constraint_type === 'FOREIGN KEY');
    
    console.log(`✅ Found ${primaryKeys.length} primary keys and ${foreignKeys.length} foreign keys`);
    
    // Summary
    console.log('\nDatabase Verification Summary:');
    console.log('-----------------------------');
    console.log(`✅ Connected to database: ${connectionInfo[0].current_database}`);
    console.log(`✅ Found ${tables.size} tables`);
    console.log(`✅ Found ${primaryKeys.length} primary keys`);
    console.log(`✅ Found ${foreignKeys.length} foreign key relationships`);
    
    if (coreTablesWithNoRecords.length === 0) {
      console.log('✅ All core tables contain records');
    }
    
    console.log('\nVerification complete! Your database appears to be properly configured.');
    
  } catch (error) {
    console.error('Error verifying database:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await db.end();
  }
}

verifyDatabase().catch(err => {
  console.error('Unhandled error during verification:', err);
  process.exit(1);
});