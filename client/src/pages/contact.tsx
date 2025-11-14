import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/contact/contact-form";
import { FreshNewsletterForm } from "@/components/newsletter/fresh-newsletter-form";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, HelpCircle, PenSquare } from "lucide-react";
import Footer from "@/components/layout/footer";

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

        {/* Direct Email Contacts */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Prefer Email?</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">General Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <a href="mailto:hello@bubblescafe.space" aria-label="Email hello@bubblescafe.space">
                    <Mail className="h-4 w-4 mr-2" />
                    hello@bubblescafe.space
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Contact the Team</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <a href="mailto:contact@bubblescafe.space" aria-label="Email contact@bubblescafe.space">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    contact@bubblescafe.space
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Support &amp; Help</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <a href="mailto:help@bubblescafe.space" aria-label="Email help@bubblescafe.space">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    help@bubblescafe.space
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Story Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <a href="mailto:submissions@bubblescafe.space" aria-label="Email submissions@bubblescafe.space">
                    <PenSquare className="h-4 w-4 mr-2" />
                    submissions@bubblescafe.space
                  </a>
                </Button>
              </CardContent>
            </Card>

            
          </div>
        </div>
        
        {/* Newsletter Subscription */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Join Our Newsletter</h2>
          
          <div className="w-full max-w-3xl mx-auto">
            <FreshNewsletterForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}