import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export default function About() {
  const { toast } = useToast();
  const form = useForm<ContactFormData>();

  const onSubmit = (data: ContactFormData) => {
    toast({
      title: "Message Sent",
      description: "Thank you for your message. I'll get back to you soon!"
    });
    form.reset();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>About Me</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert">
          <p>
            Vanessa here. Writing stories is one of my big passions. Fluent in English and Chinese. 
            I'm a big fan of horror themed stories and existential dread.
          </p>
          <p>
            I don't like making FAQs so if you have anything you need to ask or comment about 
            please leave a comment below or drop me an email with the form. I will try to reply ASAP. 
            If you do not hear back from me within a week, feel free to send another message.
          </p>
          <p className="text-lg font-semibold">
            PLEASE DO NOT REPOST ANY OF MY STORIES TO ANY OTHER SITE FOR PROFIT. 
            RETRANSLATING MY STORIES INTO ANOTHER LANGUAGE IS ALLOWED, 
            HOWEVER PLEASE USE AT YOUR OWN DISCRETION.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Me
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Your message..." className="min-h-[150px]" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit">Send Message</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
