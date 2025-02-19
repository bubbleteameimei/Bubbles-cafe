import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error("Failed to subscribe");

      toast({
        title: "Successfully subscribed!",
        description: "Welcome to our spooky newsletter 👻",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-4 space-y-3"
    >
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Join Our Newsletter</h3>
        <p className="text-sm text-muted-foreground">
          Get spooky stories delivered to your inbox
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Joining..." : "Join"}
        </Button>
      </form>
    </motion.div>
  );
}
