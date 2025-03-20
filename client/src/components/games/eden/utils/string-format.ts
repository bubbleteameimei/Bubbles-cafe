/**
 * String Formatting Utilities for Eden's Hollow
 * These utilities help with properly formatting strings that might contain
 * apostrophes, quotation marks, and other special characters.
 */

/**
 * Formats a string with proper apostrophe characters for dialog display
 * @param text Text to format for display
 * @returns Formatted text with proper apostrophes
 */
export function formatDialogText(text: string): string {
  // Replace straight apostrophes and quotes with typographically correct ones
  return text
    .replace(/'/g, ''') // Replace straight single quote with curly single quote
    .replace(/"/g, '"') // Replace straight double quote with opening curly double quote
    .replace(/"/g, '"'); // Replace straight double quote with closing curly double quote
}

/**
 * Safely escapes a string for use in JSON
 * @param text Text to escape
 * @returns Escaped text
 */
export function escapeJsonString(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Wraps text for display with proper word boundaries
 * @param text Text to wrap
 * @param maxLength Maximum length of each line
 * @returns Text split into an array of lines
 */
export function wrapText(text: string, maxLength: number = 80): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if (currentLine.length + word.length + 1 <= maxLength) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

/**
 * Formats a notification message for proper display
 * @param message Message to format
 * @param type Type of notification (for consistent styling)
 * @returns Formatted notification message
 */
export function formatNotification(message: string, type: 'info' | 'success' | 'error' | 'warning' | 'danger'): string {
  return formatDialogText(message);
}