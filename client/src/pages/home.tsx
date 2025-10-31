import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Book } from "lucide-react";
import { fetchWordPressPosts } from "@/lib/wordpress-api";
import { getExcerpt } from "@/lib/content-analysis";
import { extractEngagingExcerpt } from "@/lib/excerpt-lite";
import { sanitizeHtml } from "@/lib/sanitize";
import ContinueReadingBanner from "@/components/ContinueReadingBanner";
import { BuyMeCoffeeButton } from "@/components/BuyMeCoffeeButton";
import { SupportWritingCard } from "@/components/SupportWritingCard";
import Footer from "@/components/layout/footer";


export default function Home() {
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  
  // Basic setup for homepage without background images
  useEffect(() => {
    // Set body to default background
    document.body.style.backgroundColor = "hsl(var(--background))";
    
    return () => {
      // Clean up styling
      document.body.style.backgroundColor = "";
    };
  }, []);

  // Defer non-critical animations until hero is in viewport
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
