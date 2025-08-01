// Gmail Configuration
// This file ensures your Gmail credentials are permanently configured

export const GMAIL_CONFIG = {
  user: "vantalison@gmail.com",
  appPassword: "virz cgpj njom vddq"
};

// Function to set Gmail environment variables
export function setGmailCredentials() {
  process.env.GMAIL_USER = GMAIL_CONFIG.user;
  process.env.GMAIL_APP_PASSWORD = GMAIL_CONFIG.appPassword;
  
  console.log('✅ Gmail credentials configured for:', GMAIL_CONFIG.user);
}

// Function to verify Gmail credentials are available
export function hasGmailCredentials(): boolean {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}