import { NotificationType } from '@/contexts/notification-context';

/**
 * Utility function to add a test notification through the NotificationProvider
 * This is for testing/demo purposes and can be called from any component
 * 
 * @param addNotification - The addNotification function from the useNotifications hook
 * @param type - The type of notification (info, success, warning, error, new-story)
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
    'new-story': 'New Story Published'
  };

  const messages = {
    'info': 'This is a test information notification.',
    'success': 'Your action was completed successfully!',
    'warning': 'Please be aware of this important notice.',
    'error': 'Something went wrong. Please try again.',
    'new-story': 'A terrifying new tale has been published!'
  };

  const links = {
    'info': '/settings/notifications',
    'success': '/settings/notifications',
    'warning': '/settings/notifications',
    'error': '/settings/notifications',
    'new-story': '/reader/nostalgia' // Using a known story slug
  };

  addNotification({
    type,
    title: titles[type],
    message: messages[type],
    link: links[type],
    storyId: type === 'new-story' ? Math.floor(Math.random() * 1000) : undefined
  });
}