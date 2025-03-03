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

              <h3 className="text-lg font-semibold">Personal Information</h3>
              <p className="text-muted-foreground">
                When you create an account or interact with our Website, we may collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Name</li>
                <li>Email address</li>
                <li>Username</li>
                <li>Password (encrypted)</li>
              </ul>

              <h3 className="text-lg font-semibold">Non-Personal Information</h3>
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
              <p className="text-muted-foreground">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide, maintain, and improve our services</li>
                <li>Personalize your experience</li>
                <li>Process transactions</li>
                <li>Send notifications and updates</li>
                <li>Analyze user behavior to enhance our Website</li>
                <li>Detect and prevent fraud or abuse</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                We do not sell or share your personal data with third parties for marketing purposes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Data Security</h2>
              <p className="text-muted-foreground">
                We implement reasonable security measures to protect your information from unauthorized access, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
              <p className="text-muted-foreground">
                Your password is encrypted, and we never store plain text passwords. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Cookies and Similar Technologies</h2>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-muted-foreground">
                Email: support@example.com
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}