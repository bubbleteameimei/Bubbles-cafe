import * as bcrypt from "bcrypt";

async function generateHash() {
  const password = "testpass123";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Generated hash for testing:', hash);
}

generateHash().catch(console.error);