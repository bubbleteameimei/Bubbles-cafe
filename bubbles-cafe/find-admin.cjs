const { Client } = require('pg');

// Use environment variable directly
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString
});

async function findAdminProfile() {
  try {
    await client.connect();
    console.log('Searching for admin profile with ID: 3...\n');
    
    // Search for user with ID 3
    const userQuery = `
      SELECT id, username, email, is_admin, metadata, created_at
      FROM users 
      WHERE id = $1
    `;
    
    const userResult = await client.query(userQuery, [3]);

    if (userResult.rows.length === 0) {
      console.log('Admin user with ID 3 not found');
      return;
    }

    const user = userResult.rows[0];
    console.log('=== ADMIN PROFILE (ID: 3) ===');
    console.log(`ID: ${user.id}`);
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Admin Status: ${user.is_admin ? 'Yes' : 'No'}`);
    console.log(`Created: ${user.created_at}`);
    console.log(`Metadata: ${JSON.stringify(user.metadata, null, 2)}`);
    console.log('=============================\n');

    // Check for posts by this admin
    const postsQuery = `
      SELECT id, title, "isAdminPost", created_at
      FROM posts 
      WHERE author_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const postsResult = await client.query(postsQuery, [3]);

    if (postsResult.rows.length > 0) {
      console.log(`Posts by admin user (${postsResult.rows.length} found):`);
      postsResult.rows.forEach((post, index) => {
        console.log(`${index + 1}. "${post.title}" (ID: ${post.id}) - Admin Post: ${post.isAdminPost || 'No'}`);
      });
    } else {
      console.log('No posts found by this admin user');
    }
    
  } catch (error) {
    console.error('Error searching for admin profile:', error.message);
  } finally {
    await client.end();
  }
}

findAdminProfile();