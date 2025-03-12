import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { Button } from "./ui/button";

interface NewStoryNotificationProps {
  checkInterval?: number; // in milliseconds, default 60 seconds
  apiEndpoint?: string;
}

const NewStoryNotification: React.FC<NewStoryNotificationProps> = ({
  checkInterval = 60000,
  apiEndpoint = "/api/posts/latest"
}) => {
  const [newStory, setNewStory] = useState<{ id: number; title: string; slug: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Function to check for new stories
    const checkNewStory = async () => {
      try {
        const lastCheckTime = localStorage.getItem("lastStoryCheckTime");
        const currentTime = new Date().toISOString();
        
        // Only make the API call if it's been at least 5 minutes since the last check
        // This helps reduce unnecessary API calls
        if (!lastCheckTime || new Date(lastCheckTime).getTime() < Date.now() - 300000) {
          const response = await fetch(apiEndpoint);
          if (response.ok) {
            const data = await response.json();
            
            // Check if this is a story we haven't seen before
            const lastSeenStory = localStorage.getItem("lastSeenStoryId");
            if (data.id && (!lastSeenStory || parseInt(lastSeenStory) < data.id)) {
              setNewStory(data);
              setDismissed(false);
            }
            
            // Update the last seen story ID
            if (data.id) {
              localStorage.setItem("lastSeenStoryId", data.id.toString());
            }
          }
          
          // Update the last check time
          localStorage.setItem("lastStoryCheckTime", currentTime);
        }
      } catch (error) {
        console.error("Error checking for new stories:", error);
      }
    };

    // Initial check
    checkNewStory();

    // Set up interval
    const interval = setInterval(checkNewStory, checkInterval);
    return () => clearInterval(interval);
  }, [apiEndpoint, checkInterval]);

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {newStory && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm bg-background border border-border rounded-lg shadow-lg p-4"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              <h3 className="font-medium">New Story Available</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-3">
              A new horror story has just been published!
            </p>
            <Link href={`/reader/${newStory.slug}`}>
              <a className="text-sm font-medium text-accent hover:underline">
                Read "{newStory.title}" now
              </a>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewStoryNotification;