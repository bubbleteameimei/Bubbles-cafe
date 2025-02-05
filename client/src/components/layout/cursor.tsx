import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updatePosition);
    return () => window.removeEventListener("mousemove", updatePosition);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-50"
      animate={{ x: position.x - 16, y: position.y - 16 }}
      transition={{ type: "spring", damping: 30 }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 25.5C9.097 27.5 3.5 21.903 3.5 15S9.097 2.5 16 2.5 28.5 8.097 28.5 15 22.903 27.5 16 27.5z"
          fill="currentColor"
          fillOpacity="0.5"
        />
      </svg>
    </motion.div>
  );
}
