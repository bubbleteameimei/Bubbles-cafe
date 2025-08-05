import * as bcrypt from "bcryptjs";

async function generateHash() {
  const password = "powerPUFF7";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
}

generateHash().catch(console.error);