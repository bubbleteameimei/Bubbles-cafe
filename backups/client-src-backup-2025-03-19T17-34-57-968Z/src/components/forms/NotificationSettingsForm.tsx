"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
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

const NotificationFormSchema = z.object({
  story_updates: z.boolean().default(true),
  community_activity: z.boolean().default(true),
  security_alerts: z.boolean(),
  reading_reminders: z.boolean().default(false),
  recommendations: z.boolean().default(true),
  preferred_time: z.string().optional(),
  timezone: z.string().optional(),
})

export function NotificationSettingsForm() {
  const form = useForm<z.infer<typeof NotificationFormSchema>>({
    resolver: zodResolver(NotificationFormSchema),
    defaultValues: {
      security_alerts: true,
      story_updates: true,
      community_activity: true,
      reading_reminders: false,
      recommendations: true,
      preferred_time: "evening",
      timezone: "pst"
    },
  })

  const { toast } = useToast();
  
  function onSubmit(data: z.infer<typeof NotificationFormSchema>) {
    toast({
      title: "Notification preferences updated",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-medium">Notification Preferences</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="story_updates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Story Updates</FormLabel>
                    <FormDescription>
                      Receive notifications about new chapters and story updates.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="community_activity"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Community Activity</FormLabel>
                    <FormDescription>
                      Get notified about comments and reactions on your stories.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="security_alerts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Security Alerts</FormLabel>
                    <FormDescription>
                      Important alerts about your account security.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled
                      aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reading_reminders"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Reading Reminders</FormLabel>
                    <FormDescription>
                      Get reminders to continue reading your saved stories.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recommendations"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Story Recommendations</FormLabel>
                    <FormDescription>
                      Receive personalized horror story recommendations.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_time"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Preferred Time</FormLabel>
                    <FormDescription>
                      Choose when you'd like to receive notifications.
                    </FormDescription>
                  </div>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select preferred time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Morning Hours</SelectLabel>
                        <SelectItem value="early-morning">Early Morning (4 AM - 7 AM)</SelectItem>
                        <SelectItem value="morning">Morning (7 AM - 10 AM)</SelectItem>
                        <SelectItem value="late-morning">Late Morning (10 AM - 12 PM)</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Afternoon Hours</SelectLabel>
                        <SelectItem value="early-afternoon">Early Afternoon (12 PM - 2 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (2 PM - 4 PM)</SelectItem>
                        <SelectItem value="late-afternoon">Late Afternoon (4 PM - 6 PM)</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Evening Hours</SelectLabel>
                        <SelectItem value="early-evening">Early Evening (6 PM - 8 PM)</SelectItem>
                        <SelectItem value="evening">Evening (8 PM - 10 PM)</SelectItem>
                        <SelectItem value="late-evening">Late Evening (10 PM - 12 AM)</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Night Hours</SelectLabel>
                        <SelectItem value="early-night">Early Night (12 AM - 2 AM)</SelectItem>
                        <SelectItem value="night">Night (2 AM - 4 AM)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Time Zone</FormLabel>
                    <FormDescription>
                      Select your preferred time zone for notifications.
                    </FormDescription>
                  </div>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>North America</SelectLabel>
                        <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                        <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                        <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
                        <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                        <SelectItem value="akst">Alaska Standard Time (AKST)</SelectItem>
                        <SelectItem value="hst">Hawaii Standard Time (HST)</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Europe & Africa</SelectLabel>
                        <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                        <SelectItem value="cet">Central European Time (CET)</SelectItem>
                        <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Asia & Pacific</SelectLabel>
                        <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
                        <SelectItem value="aest">Australian Eastern Time (AEST)</SelectItem>
                        <SelectItem value="nzst">New Zealand Time (NZST)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit" className="w-full sm:w-auto">Save Preferences</Button>
      </form>
    </Form>
  )
}