import { motion } from "framer-motion";

export default function Copyright() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-1 mb-6">
        <h1 className="text-3xl font-bold">Copyright Policy</h1>
      </div>
      
      <div className="space-y-8 prose prose-invert max-w-none">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Content Ownership</h2>
          <p className="text-muted-foreground">All stories and creative works posted on our platform remain the intellectual property of their respective authors. By submitting content, you affirm that you are the original creator or have the necessary rights to share the work.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Content Usage</h2>
          <p className="text-muted-foreground">Users may not copy, reproduce, distribute, or create derivative works from any content posted on this platform without explicit permission from the copyright holder.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Copyright Claims</h2>
          <p className="text-muted-foreground">If you believe your copyrighted work has been improperly used on our platform, please contact our copyright team with:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>A description of the copyrighted work</li>
            <li>The location of the unauthorized content</li>
            <li>Your contact information</li>
            <li>A statement of good faith belief</li>
            <li>A statement of accuracy under penalty of perjury</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
