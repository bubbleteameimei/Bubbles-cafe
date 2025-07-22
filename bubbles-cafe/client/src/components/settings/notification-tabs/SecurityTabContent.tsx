import { memo } from 'react';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { CardHeader, CardContent, CardTitle, CardDescription, Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// Memoized security notification item for better performance
const SecurityNotificationItem = memo(({ 
  title, 
  description, 
  status 
}: { 
  title: string; 
  description: string; 
  status: string; 
}) => (
  <div className="flex items-start justify-between border-b pb-4">
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">
        {description}
      </p>
    </div>
    <div className="text-sm font-medium text-primary">
      {status}
    </div>
  </div>
));
SecurityNotificationItem.displayName = 'SecurityNotificationItem';

const SecurityTabContent = () => (
  <SettingsSection
    title="Security Notifications"
    description="Configure notifications for important security events related to your account."
    includeSeparator={false}
  >
    <Card>
      <CardHeader>
        <CardTitle>Security Alerts</CardTitle>
        <CardDescription>
          Manage notifications for account security and privacy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900/50 rounded-md mb-4">
          <p className="font-medium flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            Important Notice
          </p>
          <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-300">
            Security notifications cannot be disabled completely as they're essential for account protection.
          </p>
        </div>
        
        <div className="space-y-4">
          <SecurityNotificationItem
            title="Login Notifications"
            description="Get notified when your account is accessed from a new device or location"
            status="Always On"
          />
          
          <SecurityNotificationItem
            title="Password Changes"
            description="Receive alerts when your password is changed"
            status="Always On"
          />
          
          <SecurityNotificationItem
            title="Account Activity"
            description="Get a weekly summary of account activity and security status"
            status="Enabled"
          />
        </div>
      </CardContent>
    </Card>
  </SettingsSection>
);

export default memo(SecurityTabContent);