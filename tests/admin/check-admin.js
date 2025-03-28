import bcrypt from 'bcrypt';

// The hashed password from the database
const storedHash = '$2a$12$vaYRjd5t9lYFgvl2sOsXHewr7MoMxRe.NjUQvYKdKQIlKH4UgyA5K';

// Test different passwords
const passwords = ['admin', 'admin123', 'password', 'vantalison'];

async function checkPasswords() {
  for (const password of passwords) {
    try {
      const result = await bcrypt.compare(password, storedHash);
      console.log(`Password '${password}' matches stored hash: ${result}`);
    } catch (err) {
      console.error(`Error comparing password '${password}':`, err);
    }
  }
}

checkPasswords();