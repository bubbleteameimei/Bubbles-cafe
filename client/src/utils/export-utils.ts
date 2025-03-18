/**
 * Utility functions for exporting user data in various formats
 */
// Import PrivacySettings from hooks to ensure type consistency
import { PrivacySettings } from "../hooks/use-privacy-settings";
import { User } from "../types/user";

/**
 * User data export interface containing all exportable user information
 */
export interface UserDataExport {
  profile: Partial<User>;
  privacySettings: {
    profileVisible: boolean;
    shareReadingHistory: boolean;
    anonymousCommenting: boolean;
    twoFactorAuthEnabled: boolean;
    loginNotifications: boolean;
    dataRetentionPeriod: number;
    emailNotifications: boolean;
    activityTracking: boolean;
  };
  bookmarks?: any[];
  readingHistory?: any[];
  comments?: any[];
  activities?: any[];
}

/**
 * Generate a formatted date string for use in filenames
 */
export function getFormattedDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Export user data as a JSON file
 * @param userData The user data to export
 * @param filename Optional custom filename
 */
export function exportAsJson(userData: UserDataExport, filename?: string): void {
  // Create a JSON blob
  const jsonString = JSON.stringify(userData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create download link
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename || `user-data-export-${getFormattedDate()}.json`;
  
  // Trigger download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  // Clean up
  URL.revokeObjectURL(downloadLink.href);
}

/**
 * Export user data as CSV format (simplified for basic data)
 * @param userData The user data to export
 * @param filename Optional custom filename
 */
export function exportAsCsv(userData: UserDataExport, filename?: string): void {
  // Convert user profile to CSV rows
  const profileRows = Object.entries(userData.profile || {})
    .map(([key, value]) => `"Profile:${key}","${String(value).replace(/"/g, '""')}"`);
  
  // Convert privacy settings to CSV rows
  const settingsRows = Object.entries(userData.privacySettings || {})
    .map(([key, value]) => `"Privacy:${key}","${String(value).replace(/"/g, '""')}"`);
    
  // Convert activities to CSV rows (if included)
  const activityRows = (userData.activities || []).map((activity, index) => 
    `"Activity:${index + 1}","${JSON.stringify(activity).replace(/"/g, '""')}"`
  );
  
  // Combine all rows with headers
  const csvContent = [
    '"Category","Value"',
    ...profileRows,
    ...settingsRows,
    ...activityRows
  ].join('\n');
  
  // Create CSV blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename || `user-data-export-${getFormattedDate()}.csv`;
  
  // Trigger download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  // Clean up
  URL.revokeObjectURL(downloadLink.href);
}

/**
 * Export user data as a plain text file
 * @param userData The user data to export
 * @param filename Optional custom filename
 */
export function exportAsText(userData: UserDataExport, filename?: string): void {
  let textContent = "USER DATA EXPORT\n";
  textContent += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Add profile section
  textContent += "PROFILE INFORMATION\n";
  textContent += "-------------------\n";
  Object.entries(userData.profile || {}).forEach(([key, value]) => {
    textContent += `${key}: ${value}\n`;
  });
  textContent += "\n";
  
  // Add privacy settings section
  textContent += "PRIVACY SETTINGS\n";
  textContent += "----------------\n";
  Object.entries(userData.privacySettings || {}).forEach(([key, value]) => {
    const formattedValue = typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : value;
    textContent += `${key}: ${formattedValue}\n`;
  });
  textContent += "\n";
  
  // Add activities section if it exists
  if (userData.activities && userData.activities.length > 0) {
    textContent += "ACTIVITY HISTORY\n";
    textContent += "---------------\n";
    userData.activities.forEach((activity, index) => {
      textContent += `Activity ${index + 1}:\n`;
      try {
        // Format activity data as indented properties
        Object.entries(activity).forEach(([key, value]) => {
          textContent += `  ${key}: ${value}\n`;
        });
      } catch (e) {
        textContent += `  ${JSON.stringify(activity)}\n`;
      }
      textContent += "\n";
    });
  }
  
  // Create text blob
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
  
  // Create download link
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename || `user-data-export-${getFormattedDate()}.txt`;
  
  // Trigger download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  // Clean up
  URL.revokeObjectURL(downloadLink.href);
}

/**
 * Create an HTML representation of user data that can be printed
 * @param userData The user data to export
 * @returns HTML string representation of user data
 */
export function generatePrintableHtml(userData: UserDataExport): string {
  let html = `<!DOCTYPE html>
<html>
<head>
  <title>User Data Export</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2cm; }
    h1 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
    h2 { color: #444; margin-top: 30px; }
    .section { margin-bottom: a30px; }
    table { border-collapse: collapse; width: 100%; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    .footer { margin-top: 40px; font-size: 0.8em; color: #666; }
  </style>
</head>
<body>
  <h1>User Data Export</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  
  <div class="section">
    <h2>Profile Information</h2>
    <table>
      <tr><th>Property</th><th>Value</th></tr>`;
      
  // Add profile data
  Object.entries(userData.profile || {}).forEach(([key, value]) => {
    html += `<tr><td>${key}</td><td>${value}</td></tr>`;
  });
      
  html += `</table>
  </div>
  
  <div class="section">
    <h2>Privacy Settings</h2>
    <table>
      <tr><th>Setting</th><th>Value</th></tr>`;
      
  // Add privacy settings
  Object.entries(userData.privacySettings || {}).forEach(([key, value]) => {
    const formattedValue = typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : value;
    html += `<tr><td>${key}</td><td>${formattedValue}</td></tr>`;
  });
      
  html += `</table>
  </div>`;
  
  // Add activities section if it exists
  if (userData.activities && userData.activities.length > 0) {
    html += `
    <div class="section">
      <h2>Activity History</h2>
      <table>
        <tr><th>#</th><th>Type</th><th>Date</th><th>Details</th></tr>`;
        
    userData.activities.forEach((activity, index) => {
      const activityType = activity.type || activity.action || 'Activity';
      const activityDate = activity.date || activity.createdAt || activity.timestamp || '';
      
      // Create a formatted details string
      let details = '';
      try {
        // Remove common fields from details display
        const { type, action, date, createdAt, timestamp, ...detailsObj } = activity;
        details = JSON.stringify(detailsObj, null, 2)
          .replace(/[{}"]/g, '')  // Remove JSON formatting characters
          .replace(/,\n/g, '<br>') // Replace newlines with HTML breaks
          .replace(/: /g, ': ');   // Keep colons for readability
      } catch (e) {
        details = 'Activity details not available';
      }
      
      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${activityType}</td>
          <td>${activityDate}</td>
          <td><pre style="white-space: pre-wrap; font-family: monospace; margin: 0;">${details}</pre></td>
        </tr>`;
    });
    
    html += `</table>
    </div>`;
  }
  
  html += `
  <div class="footer">
    <p>This export contains your personal data as stored in our system.</p>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Open user data in a printable format in a new window
 * @param userData The user data to display for printing
 */
export function printUserData(userData: UserDataExport): void {
  const html = generatePrintableHtml(userData);
  
  // Open a new window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print your data');
    return;
  }
  
  // Write content to the window
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Trigger print when loaded
  printWindow.onload = function() {
    printWindow.focus();
    printWindow.print();
  };
}