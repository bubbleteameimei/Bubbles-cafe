import { NotificationType } from '@/contexts/notification-context';

/**
 * Utility function to add a test notification through the NotificationProvider
 * This is for testing/demo purposes and can be called from any component
 * 
 * @param addNotification - The addNotification function from the useNotifications hook
 * @param type - The type of notification (info, success, warning, error, new-story, cursed)
 */
export function addTestNotification(
  addNotification: (notification: {
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    storyId?: number;
  }) => void,
  type: NotificationType = 'new-story'
) {
  const titles = {
    'info': 'Information',
    'success': 'Success!',
    'warning': 'Warning',
    'error': 'Error Occurred',
    'new-story': 'New Story Published',
    'cursed': 'Why are you ignoring me?'
  };

  const messages = {
    'info': 'This is a test information notification.',
    'success': 'Your action was completed successfully!',
    'warning': 'Please be aware of this important notice.',
    'error': 'Something went wrong. Please try again.',
    'new-story': 'A terrifying new tale has been published!',
    'cursed': 'I noticed you haven\'t checked your notifications in a while.'
  };

  const links = {
    'info': '/settings/notifications',
    'success': '/settings/notifications',
    'warning': '/settings/notifications',
    'error': '/settings/notifications',
    'new-story': '/reader/nostalgia', // Using a known story slug
    'cursed': '/notifications'
  };

  addNotification({
    type,
    title: titles[type],
    message: messages[type],
    link: links[type],
    storyId: type === 'new-story' ? Math.floor(Math.random() * 1000) : undefined
  });
}

/**
 * Utility function to test the cursed notification effect
 * This sets up the scenario where the cursed notification will appear
 * 
 * @param addNotification - The addNotification function from useNotifications
 * @param setLastNotificationOpen - The function to set the last time notifications were opened
 * @param setShowCursedEffect - Function to directly control cursed effect visibility
 */
export function testCursedNotification(
  addNotification: (notification: {
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
  }) => void,
  setLastNotificationOpen: (date: Date | null) => void,
  setShowCursedEffect?: (show: boolean) => void
) {
  // 1. First add a regular notification so there's an unread one
  addTestNotification(addNotification, 'info');
  
  // 2. Set the lastNotificationOpen to a time in the past to simulate ignoring notifications
  const pastTime = new Date();
  pastTime.setMinutes(pastTime.getMinutes() - 15); // 15 minutes ago
  setLastNotificationOpen(pastTime);
  
  // 3. Add a cursed notification directly (optional, normally happens automatically)
  setTimeout(() => {
    addTestNotification(addNotification, 'cursed');
    
    // 4. Optionally trigger the effect directly (bypassing the normal flow for testing)
    if (setShowCursedEffect) {
      setTimeout(() => {
        setShowCursedEffect(true);
      }, 1000);
    }
  }, 500);
  
  console.log('[Test] Cursed notification test initiated');
  alert('Cursed notification test initiated. Open the notification panel in 2 seconds to see the effect.');
}