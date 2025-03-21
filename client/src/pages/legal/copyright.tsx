import { motion } from "framer-motion";

export default function Copyright() {
  return (
    <motion.div 
      className="container max-w-4xl mx-auto px-6 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-card shadow-sm border border-border rounded-xl p-8 md:p-10">
        <h1 className="text-4xl font-bold mb-10 text-center pb-4 border-b border-border">Copyright Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">Content Ownership</h2>
            <p className="leading-relaxed text-muted-foreground tracking-wide">All stories and creative works posted on our platform remain the intellectual property of their respective authors. By submitting content, you affirm that you are the original creator or have the necessary rights to share the work.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">Content Usage</h2>
            <p className="leading-relaxed text-muted-foreground tracking-wide">Users may not copy, reproduce, distribute, or create derivative works from any content posted on this platform without explicit permission from the copyright holder.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary/90">Copyright Claims</h2>
            <p className="leading-relaxed text-muted-foreground tracking-wide mb-4">If you believe your copyrighted work has been improperly used on our platform, please contact our copyright team with:</p>
            <ul className="list-disc pl-8 space-y-3 text-muted-foreground">
              <li className="pl-2">A description of the copyrighted work</li>
              <li className="pl-2">The location of the unauthorized content</li>
              <li className="pl-2">Your contact information</li>
              <li className="pl-2">A statement of good faith belief</li>
              <li className="pl-2">A statement of accuracy under penalty of perjury</li>
            </ul>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
