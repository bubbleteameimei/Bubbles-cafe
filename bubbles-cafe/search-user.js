import pkg from 'pg';
const { Client } = pkg;

async function searchUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Search for the user by email
    const result = await client.query(`
      SELECT id, username, email, is_admin, created_at, metadata
      FROM users 
      WHERE LOWER(email) = LOWER($1)
    `, ['vantalison@gmail.com']);

    if (result.rows.length > 0) {
      console.log('\n=== User Found ===');
      const user = result.rows[0];
      console.log('ID:', user.id);
      console.log('Username:', user.username);
      console.log('Email:', user.email);
      console.log('Is Admin:', user.is_admin);
      console.log('Created At:', user.created_at);
      console.log('Metadata:', user.metadata);
    } else {
      console.log('\n=== User Not Found ===');
      console.log('No user found with email: vantalison@gmail.com');
      
      // Also search for similar emails
      const similarResult = await client.query(`
        SELECT id, username, email, is_admin, created_at
        FROM users 
        WHERE email ILIKE '%vantalison%' OR email ILIKE '%gmail%'
        LIMIT 10
      `);
      
      if (similarResult.rows.length > 0) {
        console.log('\n=== Similar Email Addresses Found ===');
        similarResult.rows.forEach((user, index) => {
          console.log(`${index + 1}. ${user.email} (${user.username}) - Admin: ${user.is_admin}`);
        });
      }
    }

    // Show all users for reference
    const allUsers = await client.query(`
      SELECT id, username, email, is_admin, created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('\n=== All Users (Latest 10) ===');
    allUsers.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.username}) - Admin: ${user.is_admin} - Created: ${user.created_at}`);
    });

  } catch (error) {
    console.error('Error searching for user:', error);
  } finally {
    await client.end();
  }
}

searchUser();