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
  // Determine client environment once per render
  const isClient = typeof document !== "undefined";

  // Robust scroll lock while the overlay is visible; restore on close
  useEffect(() => {
    if (!visible || !isClient) return;

    const html = document.documentElement;
    const body = document.body;

    const prev = {
      htmlOverflow: html.style.overflow,
      htmlOverscroll: (html.style as any).overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
    };

    const scrollY = window.scrollY || window.pageYOffset || 0;

    // Lock scrolling across browsers (including iOS Safari)
    html.style.overflow = "hidden";
    (html.style as any).overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overscrollBehavior = "none";

    const prevent = (e: Event) => {
      e.preventDefault();
    };

    // Prevent wheel/touch scroll bubbling
    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });

    return () => {
      window.removeEventListener("wheel", prevent as any);
      window.removeEventListener("touchmove", prevent as any);

      html.style.overflow = prev.htmlOverflow;
      (html.style as any).overscrollBehavior = prev.htmlOverscroll || "";
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;
      body.style.width = prev.bodyWidth;
      body.style.overscrollBehavior = prev.bodyOverscroll || "";

      // Restore original scroll position
      window.scrollTo(0, scrollY);
    };
  }, [visible, isClient]);

  // Early return after hooks to satisfy rules-of-hooks
  if (!visible || !isClient) return null;

  return createPortal(
    <>
      {/* Horror message modal (unchanged content and classes) */}
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden"
        style={{
          zIndex: 2147483647,
          width: "100vw",
          height: "100vh",
          top: 0,
          left: 0,
          touchAction: "none",
          overscrollBehavior: "none",
        }}
      >
        {/* Deterministic position: center vertically then nudge up slightly via a non-animated wrapper */}
        <div
          className="absolute inset-x-0 flex justify-center"
          style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%) translateY(-5vh)' }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 26,
            }}
            className="relative bg-background/95 p-6 rounded-lg shadow-xl w-[90%] max-w-full text-center border border-[#ff0000]/80"
          >
            <div className="absolute inset-0 rounded-lg bg-[#ff0000]/10 animate-pulse" />
            <div className="relative z-10">
              {/* Glitch text (original dynamic feel) */}
              <div className="mb-6">
                <CreepyTextGlitch text={message} className="text-4xl font-bold" intensityFactor={8} />
              </div>
              {/* Button container with original behavior */}
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
        </div>
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