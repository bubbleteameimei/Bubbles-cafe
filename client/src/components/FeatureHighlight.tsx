import React from 'react';
import { motion } from 'framer-motion';
import { Book, Palette, Users, Sparkles, Heart, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <Book className="h-6 w-6" />,
    title: 'Interactive Reading',
    description: 'Immerse yourself in stories with dynamic content and interactive elements that respond to your choices.',
    color: 'text-blue-500'
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: 'Beautiful Themes',
    description: 'Choose from six carefully crafted color themes designed for optimal reading comfort at any time of day.',
    color: 'text-purple-500'
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Community Driven',
    description: 'Connect with fellow readers, share your favorite stories, and discover new narratives through our community.',
    color: 'text-green-500'
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Modern Experience',
    description: 'Enjoy smooth animations, responsive design, and accessibility features that make reading a pleasure.',
    color: 'text-amber-500'
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: 'Personalized',
    description: 'Bookmark your favorites, track your reading progress, and customize your experience to your preferences.',
    color: 'text-rose-500'
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: 'Quality Content',
    description: 'Access carefully curated stories with rich content, beautiful formatting, and engaging narratives.',
    color: 'text-indigo-500'
  }
];

const FeatureHighlight: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`w-full py-16 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Why Choose Our Platform?
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          We've built every feature with care, focusing on what makes reading enjoyable, accessible, and memorable.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Card className="h-full border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="mb-4">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br from-background to-muted ${feature.color}`}>
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeatureHighlight;