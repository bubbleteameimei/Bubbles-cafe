import { motion } from "framer-motion";

interface MistProps {
  className?: string;
}

export default function Mist({ className = "" }: MistProps) {
  return (
    <motion.div
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.05, 0.1, 0.05] }}
      transition={{ 
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(50, 50, 50, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(50, 50, 50, 0.05) 0%, transparent 50%),
            url('https://grainy-gradients.vercel.app/noise.svg')
          `,
          filter: "contrast(320%) brightness(100%)",
          opacity: 0.7,
          mixBlendMode: "overlay"
        }}
      />
    </motion.div>
  );
}