import { motion } from "framer-motion";

export default function GameHeader() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 text-center py-4 md:py-6 bg-primary bg-opacity-70"
    >
      <h1 className="font-ui text-accent text-xl md:text-2xl drop-shadow-text tracking-wider">
        DARK ECHOES: TALES OF THE ABYSS
      </h1>
    </motion.header>
  );
}
