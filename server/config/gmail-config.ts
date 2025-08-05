// Gmail Configuration
// This file ensures your Gmail credentials are loaded from environment variables

// Function to set Gmail environment variables (they should already be set from .env)
export function setGmailCredentials() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  
  if (!gmailUser || !gmailPassword) {
    console.warn('⚠️  Gmail credentials not found in environment variables. Please check your .env file.');
    return false;
  }
  
  console.log('✅ Gmail credentials loaded from environment variables for:', gmailUser);
  return true;
}

// Function to verify Gmail credentials are available
export function hasGmailCredentials(): boolean {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}