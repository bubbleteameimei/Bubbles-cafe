import { motion } from "framer-motion";

export default function Mist() {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.1 }}
      transition={{ duration: 2 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "url('https://grainy-gradients.vercel.app/noise.svg')",
          filter: "contrast(320%) brightness(100%)",
          opacity: 0.7,
          mixBlendMode: "overlay"
        }}
      />
    </motion.div>
  );
}
