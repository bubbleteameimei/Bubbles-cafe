import { motion } from "framer-motion";

export default function Copyright() {
  return (
    <motion.div 
      className="container max-w-4xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-8">Copyright Policy</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Content Ownership</h2>
          <p>All stories and creative works posted on our platform remain the intellectual property of their respective authors. By submitting content, you affirm that you are the original creator or have the necessary rights to share the work.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Content Usage</h2>
          <p>Users may not copy, reproduce, distribute, or create derivative works from any content posted on this platform without explicit permission from the copyright holder.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Copyright Claims</h2>
          <p>If you believe your copyrighted work has been improperly used on our platform, please contact our copyright team with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>A description of the copyrighted work</li>
            <li>The location of the unauthorized content</li>
            <li>Your contact information</li>
            <li>A statement of good faith belief</li>
            <li>A statement of accuracy under penalty of perjury</li>
          </ul>
        </section>
      </div>
    </motion.div>
  );
}
