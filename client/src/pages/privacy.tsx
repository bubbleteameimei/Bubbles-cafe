import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="backdrop-blur-sm bg-card/90">
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 prose prose-invert">
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <h2>Information We Collect</h2>
            <p>We collect information you voluntarily provide when you:</p>
            <ul>
              <li>Create an account or update your profile</li>
              <li>Submit or edit horror stories</li>
              <li>Leave comments on stories</li>
              <li>Rate or review content</li>
              <li>Contact us through the contact form</li>
              <li>Track your reading progress</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain the horror story platform</li>
              <li>Personalize your experience</li>
              <li>Process and manage your account</li>
              <li>Respond to your messages and comments</li>
              <li>Save your reading progress and preferences</li>
              <li>Improve our website and content</li>
            </ul>

            <h2>Data Storage</h2>
            <p>Your data is stored securely in our database and is not shared with third parties except when required by law. We implement appropriate security measures to protect your personal information.</p>

            <h2>Content Moderation</h2>
            <p>We maintain the right to moderate user-submitted content to ensure it meets our community guidelines and content policies. This includes reviewing and potentially removing content that violates our terms of service.</p>

            <h2>Cookies</h2>
            <p>We use cookies to:</p>
            <ul>
              <li>Remember your login status</li>
              <li>Track your reading progress</li>
              <li>Save your theme preferences</li>
              <li>Analyze site usage to improve user experience</li>
            </ul>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of certain data collection</li>
            </ul>

            <h2>Contact</h2>
            <p>If you have questions about this privacy policy or your data, please contact us through our contact form or email us at privacy@bubblescafe.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}