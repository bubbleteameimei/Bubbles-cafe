"use client"

import React, { memo, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { useSilentPingToggle } from "@/utils/trigger-silent-ping"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Schema defined outside component to prevent recreation on render
const NotificationFormSchema = z.object({
  story_updates: z.boolean().default(true),
  community_activity: z.boolean().default(true),
  security_alerts: z.boolean(),
  reading_reminders: z.boolean().default(false),
  recommendations: z.boolean().default(true),
  preferred_time: z.string().optional(),
  timezone: z.string().optional(),
})

// Pre-defined default values to prevent recreation
const defaultFormValues = {
  security_alerts: true,
  story_updates: true,
  community_activity: true,
  reading_reminders: false,
  recommendations: true,
  preferred_time: "evening",
  timezone: "pst"
}

// Memoized toggle switch component to reduce re-renders
const ToggleSwitch = memo(({ checked, onChange, disabled = false }: { 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => (
  <Switch
    checked={checked}
    onCheckedChange={onChange}
    disabled={disabled}
    aria-readonly={disabled}
  />
))
ToggleSwitch.displayName = 'ToggleSwitch';

// Memoized form item to prevent re-renders
const NotificationToggleItem = memo(({ 
  label, 
  description, 
  checked, 
  onChange, 
  disabled = false 
}: { 
  label: string; 
  description: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => (
  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
    <div className="space-y-0.5">
      <div className="text-base font-medium">{label}</div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
  </div>
))
NotificationToggleItem.displayName = 'NotificationToggleItem';

// Memoized select component for performance
const TimePreferenceSelect = memo(({ 
  label, 
  description, 
  value, 
  onChange, 
  options 
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  options: Record<string, { label: string, items: Array<{ value: string, label: string }> }>;
}) => (
  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
    <div className="space-y-0.5">
      <div className="text-base font-medium">{label}</div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <Select defaultValue={value} onValueChange={onChange}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(options).map(([groupName, group]) => (
          <SelectGroup key={groupName}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.items.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  </div>
))
TimePreferenceSelect.displayName = 'TimePreferenceSelect';

// Pre-defined time options to prevent recreation on render
const timeOptions = {
  morning: {
    label: 'Morning Hours',
    items: [
      { value: 'early-morning', label: 'Early Morning (4 AM - 7 AM)' },
      { value: 'morning', label: 'Morning (7 AM - 10 AM)' },
      { value: 'late-morning', label: 'Late Morning (10 AM - 12 PM)' }
    ]
  },
  afternoon: {
    label: 'Afternoon Hours',
    items: [
      { value: 'early-afternoon', label: 'Early Afternoon (12 PM - 2 PM)' },
      { value: 'afternoon', label: 'Afternoon (2 PM - 4 PM)' },
      { value: 'late-afternoon', label: 'Late Afternoon (4 PM - 6 PM)' }
    ]
  },
  evening: {
    label: 'Evening Hours',
    items: [
      { value: 'early-evening', label: 'Early Evening (6 PM - 8 PM)' },
      { value: 'evening', label: 'Evening (8 PM - 10 PM)' },
      { value: 'late-evening', label: 'Late Evening (10 PM - 12 AM)' }
    ]
  },
  night: {
    label: 'Night Hours',
    items: [
      { value: 'early-night', label: 'Early Night (12 AM - 2 AM)' },
      { value: 'night', label: 'Night (2 AM - 4 AM)' }
    ]
  }
};

// Pre-defined timezone options
const timezoneOptions = {
  northAmerica: {
    label: 'North America',
    items: [
      { value: 'est', label: 'Eastern Standard Time (EST)' },
      { value: 'cst', label: 'Central Standard Time (CST)' },
      { value: 'mst', label: 'Mountain Standard Time (MST)' },
      { value: 'pst', label: 'Pacific Standard Time (PST)' },
      { value: 'akst', label: 'Alaska Standard Time (AKST)' },
      { value: 'hst', label: 'Hawaii Standard Time (HST)' }
    ]
  },
  europeAfrica: {
    label: 'Europe & Africa',
    items: [
      { value: 'gmt', label: 'Greenwich Mean Time (GMT)' },
      { value: 'cet', label: 'Central European Time (CET)' },
      { value: 'eet', label: 'Eastern European Time (EET)' }
    ]
  },
  asiaPacific: {
    label: 'Asia & Pacific',
    items: [
      { value: 'jst', label: 'Japan Standard Time (JST)' },
      { value: 'aest', label: 'Australian Eastern Time (AEST)' },
      { value: 'nzst', label: 'New Zealand Time (NZST)' }
    ]
  }
};

// Memoized silent ping component
const SilentPingToggle = memo(({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <div className="flex flex-row items-center justify-between rounded-lg border p-4 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50">
    <div className="space-y-0.5">
      <div className="text-base font-medium">Silent Ping</div>
      <p className="text-sm text-muted-foreground">
        Occasionally receive subtle ambient notifications to enhance the immersive horror atmosphere.
      </p>
      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
        This experimental feature creates random, non-disruptive notifications that lead nowhere, enhancing the subtle unease of your reading experience.
      </p>
    </div>
    <Switch
      checked={enabled}
      onCheckedChange={onToggle}
      className="data-[state=checked]:bg-amber-700 dark:data-[state=checked]:bg-amber-800"
    />
  </div>
))
SilentPingToggle.displayName = 'SilentPingToggle';

export function NotificationSettingsForm() {
  // Optimize form initialization with stable references
  const form = useForm<z.infer<typeof NotificationFormSchema>>({
    resolver: zodResolver(NotificationFormSchema),
    defaultValues: defaultFormValues,
  })

  // Get the Silent Ping toggle controls from our custom hook
  const { isEnabled: silentPingEnabled, toggleEnabled: toggleSilentPing } = useSilentPingToggle();
  const { toast } = useToast();
  
  // Memoize the submit handler to prevent recreation on renders
  const onSubmit = useCallback((data: z.infer<typeof NotificationFormSchema>) => {
    toast({
      title: "Notification preferences updated",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }, [toast]);

  // Get the current form values for our memoized components
  const { 
    story_updates, 
    community_activity, 
    security_alerts, 
    reading_reminders, 
    recommendations,
    preferred_time,
    timezone
  } = form.watch();

  // Memoize field change handlers
  const handleStoryUpdatesChange = useCallback((value: boolean) => {
    form.setValue('story_updates', value);
  }, [form]);

  const handleCommunityActivityChange = useCallback((value: boolean) => {
    form.setValue('community_activity', value);
  }, [form]);

  const handleSecurityAlertsChange = useCallback((value: boolean) => {
    form.setValue('security_alerts', value);
  }, [form]);

  const handleReadingRemindersChange = useCallback((value: boolean) => {
    form.setValue('reading_reminders', value);
  }, [form]);

  const handleRecommendationsChange = useCallback((value: boolean) => {
    form.setValue('recommendations', value);
  }, [form]);

  const handlePreferredTimeChange = useCallback((value: string) => {
    form.setValue('preferred_time', value);
  }, [form]);

  const handleTimezoneChange = useCallback((value: string) => {
    form.setValue('timezone', value);
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-medium">Notification Preferences</h3>
          <div className="space-y-4">
            {/* Use memoized toggle items instead of FormField for better performance */}
            <NotificationToggleItem
              label="Story Updates"
              description="Receive notifications about new chapters and story updates."
              checked={story_updates}
              onChange={handleStoryUpdatesChange}
            />
            
            <NotificationToggleItem
              label="Community Activity"
              description="Get notified about comments and reactions on your stories."
              checked={community_activity}
              onChange={handleCommunityActivityChange}
            />
            
            <NotificationToggleItem
              label="Security Alerts"
              description="Important alerts about your account security."
              checked={security_alerts}
              onChange={handleSecurityAlertsChange}
              disabled={true}
            />
            
            <NotificationToggleItem
              label="Reading Reminders"
              description="Get reminders to continue reading your saved stories."
              checked={reading_reminders}
              onChange={handleReadingRemindersChange}
            />
            
            <NotificationToggleItem
              label="Story Recommendations"
              description="Receive personalized horror story recommendations."
              checked={recommendations}
              onChange={handleRecommendationsChange}
            />

            {/* Use memoized select components for better performance */}
            <TimePreferenceSelect
              label="Preferred Time"
              description="Choose when you'd like to receive notifications."
              value={preferred_time || 'evening'}
              onChange={handlePreferredTimeChange}
              options={timeOptions}
            />
            
            <TimePreferenceSelect
              label="Time Zone"
              description="Select your preferred time zone for notifications."
              value={timezone || 'pst'}
              onChange={handleTimezoneChange}
              options={timezoneOptions}
            />
            
            {/* Silent Ping Feature - A subtle horror element that creates false notifications */}
            <div className="pt-6 pb-2">
              <h3 className="text-lg font-medium">Experimental Features</h3>
            </div>
            
            <SilentPingToggle
              enabled={silentPingEnabled}
              onToggle={toggleSilentPing}
            />
          </div>
        </div>
        <Button type="submit" className="w-full sm:w-auto">Save Preferences</Button>
      </form>
    </Form>
  )
}