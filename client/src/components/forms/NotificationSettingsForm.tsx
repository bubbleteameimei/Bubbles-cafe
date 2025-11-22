"use client"

import React, { memo, useCallback, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { getApiPath } from "@/lib/asset-path"

import { Button } from "@/components/ui/button"
import {
  Form,
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

// Schema defined outside component to prevent recreation on render (camelCase keys)
const NotificationFormSchema = z.object({
  storyUpdates: z.boolean().default(true),
  communityActivity: z.boolean().default(true),
  securityAlerts: z.boolean(),
  readingReminders: z.boolean().default(false),
  recommendations: z.boolean().default(true),
  preferredTime: z.string().optional(),
  timezone: z.string().optional(),
})

// Pre-defined default values to prevent recreation
const defaultFormValues = {
  securityAlerts: true,
  storyUpdates: true,
  communityActivity: true,
  readingReminders: false,
  recommendations: true,
  preferredTime: "evening",
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

export function NotificationSettingsForm() {
  // Optimize form initialization with stable references
  const form = useForm<z.infer<typeof NotificationFormSchema>>({
    resolver: zodResolver(NotificationFormSchema),
    defaultValues: defaultFormValues,
  })

  const { toast } = useToast();

  // Load existing preferences from server
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(getApiPath("/api/user/notification-preferences"), { credentials: "include" });
        if (!res.ok) return;
        const prefs = await res.json();
        if (isMounted && prefs) {
          form.reset({
            storyUpdates: !!prefs.storyUpdates,
            communityActivity: !!prefs.communityActivity,
            securityAlerts: !!prefs.securityAlerts,
            readingReminders: !!prefs.readingReminders,
            recommendations: !!prefs.recommendations,
            preferredTime: prefs.preferredTime || 'evening',
            timezone: prefs.timezone || 'pst'
          });
        }
      } catch {
        // non-fatal
      }
    })();
    return () => { isMounted = false; };
  }, [form]);
  
  // Memoize the submit handler to prevent recreation on renders
  const onSubmit = useCallback(async (data: z.infer<typeof NotificationFormSchema>) => {
    try {
      const res = await fetch(getApiPath("/api/user/notification-preferences"), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        throw new Error('Failed to save preferences');
      }
      const saved = await res.json();
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      });
      // Sync form with server response
      form.reset({
        storyUpdates: !!saved.storyUpdates,
        communityActivity: !!saved.communityActivity,
        securityAlerts: !!saved.securityAlerts,
        readingReminders: !!saved.readingReminders,
        recommendations: !!saved.recommendations,
        preferredTime: saved.preferredTime || 'evening',
        timezone: saved.timezone || 'pst'
      });
    } catch (e) {
      toast({
        title: "Save failed",
        description: "An error occurred while saving preferences. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast, form]);

  // Get the current form values for our memoized components
  const { 
    storyUpdates, 
    communityActivity, 
    securityAlerts, 
    readingReminders, 
    recommendations,
    preferredTime,
    timezone
  } = form.watch();

  // Memoize field change handlers
  const handleStoryUpdatesChange = useCallback((value: boolean) => {
    form.setValue('storyUpdates', value);
  }, [form]);

  const handleCommunityActivityChange = useCallback((value: boolean) => {
    form.setValue('communityActivity', value);
  }, [form]);

  const handleSecurityAlertsChange = useCallback((value: boolean) => {
    form.setValue('securityAlerts', value);
  }, [form]);

  const handleReadingRemindersChange = useCallback((value: boolean) => {
    form.setValue('readingReminders', value);
  }, [form]);

  const handleRecommendationsChange = useCallback((value: boolean) => {
    form.setValue('recommendations', value);
  }, [form]);

  const handlePreferredTimeChange = useCallback((value: string) => {
    form.setValue('preferredTime', value);
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
              description="Receive notifications about new stories and updates."
              checked={storyUpdates}
              onChange={handleStoryUpdatesChange}
            />
            
            <NotificationToggleItem
              label="Community Activity"
              description="Get notified about comments and reactions on your stories."
              checked={communityActivity}
              onChange={handleCommunityActivityChange}
            />
            
            <NotificationToggleItem
              label="Security Alerts"
              description="Important alerts about your account security."
              checked={securityAlerts}
              onChange={handleSecurityAlertsChange}
              disabled={true}
            />
            
            <NotificationToggleItem
              label="Reading Reminders"
              description="Get reminders to continue reading your saved stories."
              checked={readingReminders}
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
              value={preferredTime || 'evening'}
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
            
            
          </div>
        </div>
        <Button type="submit" className="w-full sm:w-auto">Save Preferences</Button>
      </form>
    </Form>
  )
}