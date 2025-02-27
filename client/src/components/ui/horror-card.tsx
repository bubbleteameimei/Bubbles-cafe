
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface HorrorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  excerpt?: string;
  category?: string;
  imageUrl?: string;
  author?: string;
  date?: string;
  slug: string;
  className?: string;
  effect?: 'blood' | 'mist' | 'distort' | 'dark' | 'none';
}

export function HorrorCard({
  title,
  excerpt,
  category,
  imageUrl,
  author,
  date,
  slug,
  className,
  effect = 'none',
  ...props
}: HorrorCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Animation variants for card hover
  const cardVariants = {
    hover: { 
      y: -5, 
      transition: { duration: 0.3 } 
    },
    initial: { 
      y: 0, 
      transition: { duration: 0.3 } 
    }
  };

  const imageVariants = {
    hover: { 
      scale: 1.05, 
      filter: effect === 'distort' ? 'blur(1px) contrast(1.1)' : 'contrast(1.1)', 
      transition: { duration: 0.4 } 
    },
    initial: { 
      scale: 1, 
      filter: 'none', 
      transition: { duration: 0.4 } 
    }
  };

  const titleVariants = {
    hover: { 
      color: 'hsl(var(--destructive))', 
      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)', 
      transition: { duration: 0.2 } 
    },
    initial: { 
      color: 'inherit', 
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', 
      transition: { duration: 0.2 } 
    }
  };

  return (
    <motion.div
      className={cn(
        "horror-card relative overflow-hidden rounded-lg bg-card border border-border/50",
        "transition-all duration-300 shadow-md hover:shadow-horror",
        className
      )}
      initial="initial"
      animate={isHovered ? "hover" : "initial"}
      variants={cardVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <Link href={`/story/${slug}`} className="block">
        <div className="relative overflow-hidden aspect-[16/9]">
          <motion.img
            src={imageUrl || "/images/placeholder-dark.jpg"}
            alt={title}
            className="w-full h-full object-cover"
            variants={imageVariants}
          />
          
          {effect === 'blood' && isHovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-horror-blood/30 via-transparent to-transparent opacity-0 animate-pulse" />
          )}
          
          {effect === 'mist' && isHovered && (
            <div className="absolute inset-0 bg-horror-mist/20 backdrop-blur-[1px] opacity-0 animate-pulse" />
          )}
          
          {effect === 'dark' && (
            <div className={cn(
              "absolute inset-0 bg-black transition-opacity duration-500",
              isHovered ? "opacity-20" : "opacity-40"
            )} />
          )}
          
          {category && (
            <div className="absolute top-2 right-2 bg-card/90 text-card-foreground px-2 py-1 text-xs rounded font-medium backdrop-blur-sm">
              {category}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <motion.h3
            className="font-heading text-xl mb-2 line-clamp-2"
            variants={titleVariants}
          >
            {title}
          </motion.h3>
          
          {excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
              {excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {author && <span>{author}</span>}
            {date && <span>{date}</span>}
          </div>
        </div>
      </Link>
      
      {/* Visual effects based on card type */}
      {effect === 'distort' && isHovered && (
        <div className="absolute inset-0 pointer-events-none animate-distort opacity-10 bg-primary/10"></div>
      )}
    </motion.div>
  );
}
