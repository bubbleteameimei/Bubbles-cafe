import { motion } from "framer-motion";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";

export default function SupportFeedbackPage() {
  return (
    <motion.div
      className="container max-w-2xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-8">Feedback &amp; Suggestions</h1>

      <div className="prose dark:prose-invert max-w-none mb-8">
        <p>
          We value your feedback and suggestions to improve our platform. Please share your thoughts with us below.
        </p>
        <p className="text-sm text-muted-foreground">
          This form sends your feedback directly to our backend at /api/feedback so we can review and respond on the admin side.
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border shadow-lg">
        <FeedbackForm />
      </div>
    </motion.div>
  );
}
