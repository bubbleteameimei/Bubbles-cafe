import * as bcrypt from "bcrypt";

async function generateHash() {
  const password = "powerPUFF7";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Generated hash for admin password:', hash);
}

generateHash().catch(console.error);