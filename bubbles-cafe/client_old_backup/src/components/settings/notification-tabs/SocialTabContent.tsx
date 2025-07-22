import { memo } from 'react';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { CardHeader, CardContent, CardTitle, CardDescription, Card } from '@/components/ui/card';

// Memoized social notification item for better performance
const SocialNotificationItem = memo(({ 
  title, 
  description, 
  enabled 
}: { 
  title: string; 
  description: string; 
  enabled: boolean; 
}) => (
  <div className="flex items-start justify-between border-b pb-4">
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">
        {description}
      </p>
    </div>
    <div className={`text-sm font-medium ${enabled ? 'text-primary' : 'text-muted-foreground'}`}>
      {enabled ? 'Enabled' : 'Disabled'}
    </div>
  </div>
));
SocialNotificationItem.displayName = 'SocialNotificationItem';

const SocialTabContent = () => (
  <SettingsSection
    title="Social Interactions"
    description="Control notifications for social interactions like comments, mentions, and follows."
    includeSeparator={false}
  >
    <Card>
      <CardHeader>
        <CardTitle>Social Activity</CardTitle>
        <CardDescription>
          Configure notifications for social interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <SocialNotificationItem
            title="Comment Notifications"
            description="Receive notifications when someone comments on your stories"
            enabled={true}
          />
          
          <SocialNotificationItem
            title="Mention Notifications"
            description="Receive notifications when someone mentions you in a comment"
            enabled={false}
          />
          
          <SocialNotificationItem
            title="Follow Notifications"
            description="Receive notifications when someone follows your profile"
            enabled={true}
          />
        </div>
      </CardContent>
    </Card>
  </SettingsSection>
);

export default memo(SocialTabContent);