import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Smartphone, BadgeInfo, Chrome } from "lucide-react";

export default function InstallAppPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-decorative">Install Bubble’s Cafe</h1>
        <p className="text-muted-foreground mt-2">
          Add Bubble’s Cafe to your Home Screen for a fast, immersive reading experience.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card>
            <CardHeader className="flex-row items-center gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle>iPhone &amp; iPad</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Open bubblescafe.space in Safari</li>
                <li className="flex items-center gap-2">
                  Tap Share
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="inline-block"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                </li>
                <li>Scroll and select “Add to Home Screen”</li>
                <li>Tap “Add” to confirm</li>
              </ol>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <Card>
            <CardHeader className="flex-row items-center gap-3">
              <Chrome className="h-5 w-5 text-primary" />
              <CardTitle>Android</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Open in Chrome</li>
                <li>Tap the “Add to Home Screen” banner</li>
                <li>Or open menu → “Install app”</li>
                <li>Tap “Install” to confirm</li>
              </ol>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex-row items-center gap-3">
              <BadgeInfo className="h-5 w-5 text-primary" />
              <CardTitle>Having trouble?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm space-y-2">
                <li>Use Safari (iOS) or Chrome (Android)</li>
                <li>Refresh the page and try again</li>
                <li>Disable ad blockers temporarily</li>
                <li>Search “How to install PWA” for your device</li>
              </ul>
              <div className="mt-4 text-xs text-muted-foreground">
                Want to go back?{" "}
                <button
                  className="underline hover:text-primary"
                  onClick={() => setLocation("/")}
                >
                  Return to Home
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}