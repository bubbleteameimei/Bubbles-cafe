import React from "react";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";

export default function ComingSoonCollectionsPage() {
  const canonical = "/coming-soon";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEO
        title="Coming Soon – Book Collections"
        description="Preview of upcoming horror collections from Bubble's Cafe."
        canonical={canonical}
        type="website"
      />
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl w-full mx-auto text-center space-y-8"
        >
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.25em] text-primary/80">Coming Soon</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold">
              Upcoming Collections
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              A glimpse into the worlds I&apos;m building behind the scenes. These collections
              aren&apos;t live yet, but their bones are already taking shape.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 mt-4">
            <motion.article
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative rounded-xl border border-border/60 bg-card/80 backdrop-blur-md px-6 py-7 shadow-lg text-left"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-primary/80 mb-2">
                Collection I
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 font-serif">
                The Anatomy of the Devouring Self
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A collection of stories about the ways we consume ourselves from the inside out:
                obsession, shame, intrusive thoughts, and the quiet violences we perform on our
                own minds. Each story dissects a different way a person can become the monster
                they fear.
              </p>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="relative rounded-xl border border-border/60 bg-card/80 backdrop-blur-md px-6 py-7 shadow-lg text-left"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-primary/80 mb-2">
                Collection II
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 font-serif">
                Ways to Eat Yourself Alive
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stories about self-destruction dressed up as comfort: bad habits, bad people, and
                bad choices we keep inviting back. This collection looks at the tenderness of
                ruin—how sometimes we walk willingly into the jaws and pretend it&apos;s love.
              </p>
            </motion.article>
          </div>

          <div className="pt-4 space-y-3 text-sm text-muted-foreground max-w-xl mx-auto">
            <p>
              These collections are still in progress. Some of their stories already live on
              Bubble&apos;s Cafe in early forms; others only exist in notebooks and half-finished
              drafts.
            </p>
            <p>
              When they&apos;re ready, you&apos;ll be able to read them here in full. For now, think of
              this page as a small promise: more is coming.
            </p>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
