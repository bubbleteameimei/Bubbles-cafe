
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
              <li>Leave comments on stories</li>
              <li>Contact us through the contact form</li>
              <li>Track your reading progress</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Respond to your messages and comments</li>
              <li>Save your reading progress</li>
              <li>Improve our website and content</li>
            </ul>

            <h2>Data Storage</h2>
            <p>Your data is stored securely in our database and is not shared with third parties.</p>

            <h2>Cookies</h2>
            <p>We use cookies to remember your preferences and reading progress.</p>

            <h2>Contact</h2>
            <p>If you have questions about this privacy policy, please contact us through our contact form.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
