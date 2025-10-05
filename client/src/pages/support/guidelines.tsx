import { motion } from "framer-motion";

export default function Guidelines() {
  return (
    <motion.div
      className="container max-w-4xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-6">Community Guidelines</h1>

      {/* Table of Contents */}
      <nav className="mb-8 rounded-lg border border-border bg-muted/40 p-4">
        <p className="font-medium mb-3">Quick links</p>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          <li><a href="#values" className="underline">Our Community Values</a></li>
          <li><a href="#content-standards" className="underline">Content Standards</a></li>
          <li><a href="#interaction" className="underline">Interaction Guidelines</a></li>
          <li><a href="#plagiarism" className="underline">Plagiarism Policy</a></li>
          <li><a href="#moderation" className="underline">Moderation</a></li>
        </ul>
      </nav>

      <div className="prose dark:prose-invert max-w-none">
        <section id="values" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Community Values</h2>
          <p>
            Our horror story community strives to be a welcoming space for writers and readers to share and enjoy creepy content.
            We believe in fostering creativity while maintaining respect for all members.
          </p>
        </section>

        <section id="content-standards" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Content Standards</h2>
          <p>While we embrace horror and the macabre, we have guidelines about what content is appropriate:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Clearly label mature content (gore, extreme violence, etc.)</li>
            <li>No glorification of real-world tragedies or criminals</li>
            <li>No explicit sexual content involving minors</li>
            <li>No hate speech or content that targets specific groups</li>
            <li>No doxxing or sharing others' personal information</li>
          </ul>
        </section>

        <section id="interaction" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Interaction Guidelines</h2>
          <p>When interacting with other community members:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide constructive feedback, not destructive criticism</li>
            <li>Respect different writing styles and horror preferences</li>
            <li>Don't harass or bully other members</li>
            <li>Report inappropriate content instead of engaging with it</li>
            <li>Be mindful that behind every story is a real person</li>
          </ul>
        </section>

        <section id="plagiarism" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Plagiarism Policy</h2>
          <p>We take intellectual property seriously:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Only post original content you created or have permission to share</li>
            <li>Give proper credit when building upon others' ideas</li>
            <li>Report suspected plagiarism to moderators</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Violations of our plagiarism policy may result in content removal and account restrictions.
          </p>
        </section>

        <section id="moderation" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Moderation</h2>
          <p>Our moderation team works to ensure these guidelines are followed. Actions they may take include:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Content removal</li>
            <li>Warnings</li>
            <li>Temporary restrictions</li>
            <li>Permanent bans for serious or repeated violations</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            If you believe a moderation action was taken in error, you can appeal through our{" "}
            <a href="/contact" className="underline">contact form</a>.
          </p>
        </section>

        <p className="text-sm text-muted-foreground">
          Return to the <a href="/community" className="underline">Community page</a> or continue browsing stories.
        </p>
      </div>
    </motion.div>
  );
}
