import React, { useState, useEffect } from 'react';
import { useRefresh } from '@/contexts/refresh-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, Clock, Info, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RefreshDemoPage: React.FC = () => {
  const { refresh, isRefreshing, getLastRefreshedText } = useRefresh();
  const [demoData, setDemoData] = useState<string[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const [showTip, setShowTip] = useState(true);
  
  // Hide the tip after 5 seconds
  useEffect(() => {
    if (showTip) {
      const timer = setTimeout(() => {
        setShowTip(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showTip]);
  
  // Function to generate new data items
  const generateNewData = () => {
    const timestamp = new Date().toLocaleTimeString();
    const newItem = `Item ${refreshCount + 1} - Generated at ${timestamp}`;
    setDemoData(prev => [newItem, ...prev].slice(0, 10)); // Keep the list at a maximum of 10 items
    setRefreshCount(prev => prev + 1);
  };
  
  // Handle a manual refresh
  const handleManualRefresh = async () => {
    await refresh();
    generateNewData();
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Pull to Refresh Demo</h1>
      
      <AnimatePresence>
        {showTip && (
          <motion.div 
            className="bg-primary/10 rounded-lg p-4 mb-6 border border-primary/20 flex items-start gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Smartphone className="text-primary shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-medium text-primary">Mobile Gesture</h3>
              <p className="text-sm text-muted-foreground">
                On mobile devices, pull down from the top of the screen and release to refresh content.
                Try it by swiping down when scrolled to the top.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Card className="mb-6 p-6 border-primary/20">
        <div className="flex items-start gap-3 mb-4">
          <Info className="text-primary shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-medium">About this feature</h3>
            <p className="text-sm text-muted-foreground">
              The pull-to-refresh feature provides an intuitive way to refresh content 
              by pulling down on the screen, similar to native mobile apps. It shows a visual 
              indicator with a progress wheel that fills as you pull, and changes color when 
              you've pulled far enough to trigger a refresh.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-muted/50 p-3 rounded-md">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <span className="text-sm font-medium">{getLastRefreshedText()}</span>
          </div>
          
          <Button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
            variant="outline"
          >
            <RefreshCw className={isRefreshing ? "animate-spin" : ""} size={16} />
            {isRefreshing ? "Refreshing..." : "Manual Refresh"}
          </Button>
        </div>
      </Card>
      
      <h2 className="text-xl font-semibold mb-4">Refreshed Content</h2>
      
      <div className="grid gap-4">
        {demoData.length === 0 ? (
          <Card className="p-6 text-center bg-muted/30">
            <p className="text-muted-foreground">
              No data yet. Pull down to refresh or click the button above.
            </p>
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            {demoData.map((item, index) => (
              <motion.div 
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-4 hover:border-primary/30 transition-colors">
                  <p>{item}</p>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default RefreshDemoPage;