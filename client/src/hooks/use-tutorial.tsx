import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TutorialStep {
  target: string;
  content: string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const tutorialSteps: TutorialStep[] = [
  {
    target: '[data-tutorial="home"]',
    content: 'Welcome to our story platform! Start your journey here.',
    title: 'Welcome!',
    placement: 'right'
  },
  {
    target: '[data-tutorial="library"]',
    content: 'Explore our collection of stories in the Library section.',
    title: 'Story Library',
    placement: 'right'
  },
  {
    target: '[data-tutorial="reader"]',
    content: 'Read stories in our immersive reader with customizable settings.',
    title: 'Story Reader',
    placement: 'right'
  },
  {
    target: '[data-tutorial="explore"]',
    content: 'Discover new and featured stories in the Explore section.',
    title: 'Explore Content',
    placement: 'right'
  },
  {
    target: '[data-tutorial="theme"]',
    content: 'Customize your reading experience with different themes and settings.',
    title: 'Personalization',
    placement: 'right'
  }
];

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  getCurrentStep: () => TutorialStep | null;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Check if it's the user's first visit
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      toast({
        title: "Welcome to our platform!",
        description: "Would you like a quick tour? Click 'Start Tutorial' to begin.",
        action: <button onClick={() => start()} className="bg-primary text-primary-foreground px-4 py-2 rounded-md">Start Tutorial</button>,
        duration: 10000,
      });
    }
  }, []);

  const start = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const stop = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const next = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      stop();
      toast({
        title: "Tutorial Complete!",
        description: "You're all set to explore our platform. Enjoy your stay!",
      });
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getCurrentStep = () => {
    return isActive ? tutorialSteps[currentStep] : null;
  };

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        start,
        stop,
        next,
        prev,
        getCurrentStep,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
