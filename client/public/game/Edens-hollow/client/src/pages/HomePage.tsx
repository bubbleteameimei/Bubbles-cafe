import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function HomePage() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-darkBg text-textColor p-4">
      {/* Pixel Art Overlay */}
      <div className="pixel-overlay fixed inset-0 opacity-5 z-10 pointer-events-none"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center max-w-3xl w-full"
      >
        <h1 className="font-ui text-accent text-3xl md:text-4xl mb-6 drop-shadow-text tracking-wider">
          EDEN'S HOLLOW
        </h1>
        
        <Card className="bg-primary bg-opacity-80 pixel-border backdrop-blur-sm">
          <CardContent className="p-6 md:p-8">
            <p className="font-story text-lg md:text-xl mb-8 leading-relaxed">
              Enter a realm of psychological horror where your choices determine your fate and sanity. 
              Five standalone tales await, each exploring the depths of madness and the fragility of the human mind.
            </p>
            
            <p className="font-dialogue text-base md:text-lg mb-10 italic opacity-90">
              Will you preserve your sanity, or succumb to the darkness that lurks within Eden's Hollow?
            </p>
            
            <div className="flex flex-col space-y-4">
              <Button 
                onClick={() => setLocation("/game")} 
                className="bg-secondary hover:bg-accent text-textColor font-ui py-3 px-6 text-sm transition-colors duration-300"
              >
                DESCEND INTO MADNESS
              </Button>
              
              <Button 
                onClick={() => window.open("https://github.com", "_blank")} 
                variant="outline"
                className="bg-uiElements hover:bg-primary text-textColor font-ui py-3 px-6 text-sm transition-colors duration-300"
              >
                ABOUT THE AUTHOR
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
