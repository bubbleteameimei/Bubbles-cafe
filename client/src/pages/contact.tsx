import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/contact/contact-form";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import Mist from "@/components/effects/mist";

export default function Contact() {
  return (
    <div className="relative min-h-screen">
      <Mist />
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Card className="max-w-2xl mx-auto backdrop-blur-sm bg-card/90">
          <CardHeader>
            <CardTitle className="text-center">Contact Me</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>

        <NewsletterForm />
      </div>
    </div>
  );
}