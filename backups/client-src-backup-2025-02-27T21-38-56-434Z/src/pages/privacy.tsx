import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card className="backdrop-blur-sm bg-card/90">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
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

              <h3 className="text-lg font-semibold mt-4">Personal Information</h3>
              <p className="text-muted-foreground">
                When you register, comment, or interact with our Website, we may collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Name</li>
                <li>Email address</li>
                <li>Any other information you voluntarily provide</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">Non-Personal Information</h3>
              <p className="text-muted-foreground">
                We may collect data that does not directly identify you, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Browser type and version</li>
                <li>IP address</li>
                <li>Device information</li>
                <li>Usage data (e.g., pages visited, time spent on the Website)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">How We Use Your Information</h2>
              <p className="text-muted-foreground">We use the collected information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide and improve our services</li>
                <li>Customize your experience on the Website</li>
                <li>Enable interactive features (e.g., commenting, story tracking)</li>
                <li>Respond to inquiries or requests</li>
                <li>Monitor Website security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="text-muted-foreground">
                We do not sell or share your personal data with third parties for marketing purposes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your data. However, no online platform is completely secure. 
                We encourage you to use strong passwords and exercise caution when sharing personal information.
              </p>
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
              <h2 className="text-xl font-semibold">Contact Us</h2>
              <p className="text-muted-foreground">
                For questions or concerns about this privacy policy or your data, please contact us through our contact form 
                or email us at vanessachiwetalu@gmail.com
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}