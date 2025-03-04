import { motion } from "framer-motion";

export default function Terms() {
  return (
    <motion.div 
      className="container max-w-4xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
          <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Content</h2>
          <p>Users are responsible for the content they submit, post, or display on the platform. All content must comply with our community guidelines and content policies.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Content must be original or properly attributed</li>
            <li>No harmful, illegal, or inappropriate content</li>
            <li>Respect intellectual property rights</li>
            <li>Follow community guidelines</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Account Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Maintain account security</li>
            <li>Provide accurate information</li>
            <li>Follow community guidelines</li>
            <li>Report violations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Modifications to Service</h2>
          <p>We reserve the right to modify or discontinue the service at any time. We will provide notice of any significant changes.</p>
        </section>
      </div>
    </motion.div>
  );
}
