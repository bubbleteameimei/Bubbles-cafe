import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import CreepyTextGlitch from "@/components/errors/CreepyTextGlitch";
import { Button } from "@/components/ui/button";

interface ReaderHorrorOverlayPortalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

/**
 * ReaderHorrorOverlayPortal
 * Renders the existing horror overlay via a React portal to ensure it sits above all content
 * and doesn't require scrolling to view. The modal content and text remain unchanged.
 */
export default function ReaderHorrorOverlayPortal({
  visible,
  message,
  onClose,
}: ReaderHorrorOverlayPortalProps) {
  if (!visible || typeof document === "undefined") return null;

  // Lock scroll while the overlay is visible and restore on close
  useEffect(() => {
    if (!visible) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "contain";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = prevOverscroll;
    };
  }, [visible]);

  return createPortal(
    <>
      {/* Horror message modal (unchanged content and classes) */}
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md"
        style={{
          zIndex: 2147483647,
          width: "100vw",
          height: "100vh",
          top: 0,
          left: 0,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="relative bg-background/95 p-6 rounded-lg shadow-xl w-[90%] max-w-full text-center border border-[#ff0000]/80"
        >
          <div className="absolute inset-0 rounded-lg bg-[#ff0000]/10 animate-pulse" />
          <div className="relative z-10">
            <div className="mb-6">
              <CreepyTextGlitch text={message} className="text-4xl font-bold" intensityFactor={8} />
            </div>
            {/* The button is wrapped in a div with no animations to keep it stable */}
            <div className="mt-4">
              <Button
                variant="outline"
                className="border-[#ff0000]/60 bg-background hover:bg-background/90 text-foreground w-full py-6"
                onClick={onClose}
              >
                <span className="mx-auto text-lg font-medium">I understand, I'm sorry</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Overlay to prevent interaction with the page when horror message is shown */}
      <div
        className="fixed inset-0 z-[999]"
        style={{ pointerEvents: "all", zIndex: 2147483646, width: "100vw", height: "100vh", top: 0, left: 0 }}
        aria-hidden="true"
      />
    </>,
    document.body
  );
}