import { motion } from "framer-motion";

export default function Guidelines() {
  return (
    <motion.div 
      className="container max-w-4xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-8">Community Guidelines</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Content Guidelines</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Stories should be original and your own work</li>
            <li>Content must be appropriate for mature readers</li>
            <li>Proper trigger warnings must be included when necessary</li>
            <li>No explicit gore or extreme violence</li>
            <li>Respect copyright and intellectual property rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Community Interaction</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Be respectful to other community members</li>
            <li>Provide constructive feedback</li>
            <li>No harassment or bullying</li>
            <li>Report inappropriate content or behavior</li>
            <li>Engage in meaningful discussions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quality Standards</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Proofread your submissions</li>
            <li>Use appropriate formatting</li>
            <li>Provide clear story descriptions</li>
            <li>Tag content appropriately</li>
            <li>Respond to feedback constructively</li>
          </ul>
        </section>
      </div>
    </motion.div>
  );
}
