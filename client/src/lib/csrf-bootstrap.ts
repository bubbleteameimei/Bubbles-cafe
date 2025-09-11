
let csrfToken: string | null = null;

export async function initializeCSRF(): Promise<void> {
  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      csrfToken = data.csrfToken;
    }
  } catch (error) {
    console.error('Failed to initialize CSRF token:', error);
  }
}

export function getCSRFToken(): string | null {
  return csrfToken;
}

export function setCSRFToken(token: string): void {
  csrfToken = token;
}
