import React from 'react';
import { motion } from 'framer-motion';

const MistEffect: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%)',
          filter: 'blur(40px)'
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%)',
          filter: 'blur(30px)'
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

export default MistEffect;