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
              <h2 className="text-xl font-semibold">Information We Collect</h2>
              <p className="text-muted-foreground">We collect information you voluntarily provide when you:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Create an account or update your profile</li>
                <li>Submit or edit horror stories</li>
                <li>Leave comments on stories</li>
                <li>Rate or review content</li>
                <li>Contact us through the contact form</li>
                <li>Track your reading progress</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">How We Use Your Information</h2>
              <p className="text-muted-foreground">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide and maintain the horror story platform</li>
                <li>Personalize your experience</li>
                <li>Process and manage your account</li>
                <li>Respond to your messages and comments</li>
                <li>Save your reading progress and preferences</li>
                <li>Improve our website and content</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Data Storage</h2>
              <p className="text-muted-foreground">
                Your data is stored securely in our database and is not shared with third parties except when required by law. 
                We implement appropriate security measures to protect your personal information.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Content Moderation</h2>
              <p className="text-muted-foreground">
                We maintain the right to moderate user-submitted content to ensure it meets our community guidelines 
                and content policies. This includes reviewing and potentially removing content that violates our terms of service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Cookies</h2>
              <p className="text-muted-foreground">We use cookies to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Remember your login status</li>
                <li>Track your reading progress</li>
                <li>Save your theme preferences</li>
                <li>Analyze site usage to improve user experience</li>
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
              <h2 className="text-xl font-semibold">Content Ownership</h2>
              <p className="text-muted-foreground">
                All user-submitted horror stories remain the intellectual property of their respective authors. 
                By submitting content to our platform, you grant us a non-exclusive license to display, 
                distribute, and promote your content within our platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Age Restrictions</h2>
              <p className="text-muted-foreground">
                Due to the horror-themed nature of our content, our platform is intended for users aged 13 and above. 
                Users under 18 should have parental consent before using our services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Contact</h2>
              <p className="text-muted-foreground">
                If you have questions about this privacy policy or your data, please contact us through our contact form 
                or email us at privacy@bubblescafe.com
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}