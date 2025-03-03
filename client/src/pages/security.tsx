import React from "react";

export default function SecurityPage() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-1 mb-6">
        <h1 className="text-3xl font-bold">Security & Safety</h1>
      </div>

      <div className="space-y-8 prose prose-invert max-w-none">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Data Protection</h2>
          <p className="text-muted-foreground">
            We take the protection of your data seriously. All personal information is encrypted and stored securely. We use industry-standard encryption protocols to ensure that your data remains private and protected from unauthorized access.
          </p>
          <p className="text-muted-foreground">
            Your password is hashed using strong algorithms, and we never store plaintext passwords. We regularly update our security measures to protect against new threats and vulnerabilities.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Content Guidelines</h2>
          <p className="text-muted-foreground">
            While we embrace the horror genre in all its forms, we maintain certain content guidelines to ensure a safe and respectful environment for all users. Content that promotes hate speech, discrimination, or real-world violence is not permitted.
          </p>
          <p className="text-muted-foreground">
            We encourage the use of content warnings for particularly disturbing material, allowing readers to make informed choices about what they consume. Our moderation team reviews reported content to ensure compliance with these guidelines.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Account Security</h2>
          <p className="text-muted-foreground">
            We recommend using strong, unique passwords for your account. Consider enabling two-factor authentication for an additional layer of security. Be cautious about sharing account details, and always log out when using shared devices.
          </p>
          <p className="text-muted-foreground">
            If you notice any suspicious activity on your account, please contact our support team immediately. We're here to help ensure that your experience on our platform remains secure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Reporting Issues</h2>
          <p className="text-muted-foreground">
            If you encounter any security issues, inappropriate content, or behavior that violates our guidelines, please use the reporting features available throughout the site. Our team reviews all reports promptly and takes appropriate action.
          </p>
          <p className="text-muted-foreground">
            For urgent security concerns, please contact us directly at security@example.com.
          </p>
        </section>
      </div>
    </div>
  );
}