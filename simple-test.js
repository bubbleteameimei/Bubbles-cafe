/**
 * Simple test script to check if our files have been updated correctly
 */

import fs from 'fs';

// Check files
const checkFiles = () => {
  const files = [
    'client/src/components/ui/notification-icon.tsx',
    'client/src/utils/add-test-notification.ts',
    'client/src/components/layout/navigation.tsx'
  ];
  
  console.log('Checking file updates:');
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      console.log(`\n✅ ${file} exists`);
      
      // Print a snippet of each file to verify contents
      const snippet = content.split('\n').slice(0, 5).join('\n');
      console.log(`First 5 lines:\n${snippet}\n...`);
      
      // Check for specific content to verify implementation
      if (file.includes('notification-icon.tsx')) {
        if (content.includes('TabsList') && content.includes('TabsContent')) {
          console.log('✅ Tabs implementation found in notification icon');
        } else {
          console.log('❌ Tabs implementation NOT found in notification icon');
        }
        
        if (content.includes('Settings')) {
          console.log('✅ Settings button found in notification icon');
        } else {
          console.log('❌ Settings button NOT found in notification icon');
        }
      }
      
      if (file.includes('navigation.tsx')) {
        if (!content.includes('onClick={() => setLocation(\'/notifications\')}')) {
          console.log('✅ Navigation no longer redirects to notification page');
        } else {
          console.log('❌ Navigation still redirects to notification page');
        }
      }
      
      if (file.includes('add-test-notification.ts')) {
        if (content.includes('/reader/nostalgia')) {
          console.log('✅ Updated story link found in test notifications');
        } else {
          console.log('❌ Updated story link NOT found in test notifications');
        }
      }
      
    } catch (err) {
      console.error(`❌ Error with ${file}: ${err.message}`);
    }
  });
  
  // Check App.tsx for route removal
  try {
    const appContent = fs.readFileSync('client/src/App.tsx', 'utf8');
    if (!appContent.includes('<Route path="/notifications" component={NotificationsPage} />')) {
      console.log('✅ Notifications page route removed from App.tsx');
    } else {
      console.log('❌ Notifications page route still exists in App.tsx');
    }
  } catch (err) {
    console.error(`❌ Error checking App.tsx: ${err.message}`);
  }
};

checkFiles();