"use client"

import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useMutation } from "@tanstack/react-query"
import { apiRequest } from "@/lib/queryClient"

// Schema for newsletter subscription
const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type NewsletterFormValues = z.infer<typeof newsletterSchema>

export default function NewsletterForm() {
  const { toast } = useToast()
  
  // Form definition with validation
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  })

  // Setup mutation for API request
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: NewsletterFormValues) => {
      // Use the direct endpoint that bypasses CSRF protection
      return apiRequest('/api/newsletter-direct/subscribe', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter.",
        variant: "default",
      })
      form.reset()
    },
    onError: (error) => {
      console.error("Newsletter subscription error:", error)
      toast({
        title: "Subscription failed",
        description: "An error occurred while subscribing. Please try again.",
        variant: "destructive",
      })
    }
  })

  // Form submission handler
  async function onSubmit(data: NewsletterFormValues) {
    mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <div className="flex flex-col">
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    className="py-2.5 sm:py-3 px-4 block w-full border-neutral-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs mt-1" />
              </div>
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full sm:w-auto whitespace-nowrap py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
        >
          {isPending ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    </Form>
  )
}