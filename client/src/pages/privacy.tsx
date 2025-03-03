
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FullscreenPage } from "@/components/ui/fullscreen-page";
import { X } from "lucide-react";

export default function Privacy() {
  const [isFullscreen, setIsFullscreen] = useState(true);

  const handleClose = () => {
    setIsFullscreen(false);
    // You might want to navigate back or show a non-fullscreen version
    window.history.back();
  };

  return (
    <FullscreenPage onClose={handleClose}>
      <div className="w-full h-full overflow-auto pb-12">
        <Card className="backdrop-blur-sm bg-card/90 border-none shadow-none">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 prose prose-invert max-w-none">
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Content Protection Notice</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  ALL CONTENT ON THIS SITE IS ORIGINAL AND PROTECTED. UNAUTHORIZED REPRODUCTION, PLAGIARISM, OR COMMERCIAL TRANSLATION OF MY WORK IS STRICTLY PROHIBITED AND MAY RESULT IN LEGAL ACTION. IF YOU WISH TO SHARE OR USE ANY CONTENT, PLEASE OBTAIN PRIOR PERMISSION BY CONTACTING ME DIRECTLY.

                  THANK YOU FOR YOUR SUPPORT, AND ENJOY THE STORIES.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Information We Collect</h2>
                <p className="text-muted-foreground">We may collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Personal information (email, name) when you create an account</li>
                  <li>Usage data (pages visited, time spent)</li>
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and location data</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">How We Use Information</h2>
                <p className="text-muted-foreground">We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide and maintain our services</li>
                  <li>Improve and personalize your experience</li>
                  <li>Send notifications about updates or new features</li>
                  <li>Analyze usage patterns to enhance our site</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Your Rights</h2>
                <p className="text-muted-foreground">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Access your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of certain data collection</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-muted-foreground">
                  Email: vanessachiwetalu@gmail.com
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </FullscreenPage>
  );
}
