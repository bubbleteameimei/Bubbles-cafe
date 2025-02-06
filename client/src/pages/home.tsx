import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-serif mb-4">Welcome to Bubble's Cafe</h1>
          <p className="text-muted-foreground">A place for horror and existential fiction.</p>
        </motion.div>
      </div>
    </div>
  );
}