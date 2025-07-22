import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/contact/contact-form";
import { FreshNewsletterForm } from "@/components/newsletter/fresh-newsletter-form";

export default function Contact() {
  return (
    <div className="relative min-h-screen">
      <div className="container mx-auto px-4 py-12 space-y-16">
        <Card className="max-w-2xl mx-auto backdrop-blur-sm bg-card/90">
          <CardHeader>
            <CardTitle className="text-center">Contact Me</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
        
        {/* Newsletter Subscription */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Join Our Newsletter</h2>
          
          <div className="w-full max-w-3xl mx-auto">
            <FreshNewsletterForm />
          </div>
        </div>
      </div>
    </div>
  );
}