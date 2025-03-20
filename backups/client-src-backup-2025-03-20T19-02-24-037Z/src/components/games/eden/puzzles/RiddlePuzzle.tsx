import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface RiddlePuzzleProps {
  data: {
    riddle: string;
    answer: string;
    caseSensitive: boolean;
    alternateAnswers?: string[];
  };
  onSolveAttempt: (success: boolean) => void;
}

export function RiddlePuzzle({ data, onSolveAttempt }: RiddlePuzzleProps) {
  const [answer, setAnswer] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleSubmit = () => {
    // Check if the answer is correct
    let isCorrect = false;
    
    // Process answer for comparison
    const processedAnswer = data.caseSensitive 
      ? answer.trim() 
      : answer.trim().toLowerCase();
    
    const correctAnswer = data.caseSensitive 
      ? data.answer 
      : data.answer.toLowerCase();
    
    // Check main answer
    if (processedAnswer === correctAnswer) {
      isCorrect = true;
    }
    
    // Check alternate answers if provided
    if (!isCorrect && data.alternateAnswers) {
      const processedAlternates = data.alternateAnswers.map(alt => 
        data.caseSensitive ? alt : alt.toLowerCase()
      );
      
      if (processedAlternates.includes(processedAnswer)) {
        isCorrect = true;
      }
    }
    
    // Visual feedback
    setIsAnimating(true);
    
    setTimeout(() => {
      onSolveAttempt(isCorrect);
      setIsAnimating(false);
      
      if (!isCorrect) {
        // Clear answer on failure
        setAnswer('');
      }
    }, 1000);
  };
  
  return (
    <div className="riddle-puzzle">
      <motion.div 
        className="p-4 border border-amber-900/30 bg-amber-950/10 rounded-md mb-6"
        animate={
          isAnimating 
            ? { 
                borderColor: ['rgba(146, 64, 14, 0.3)', 'rgba(146, 64, 14, 0.6)', 'rgba(146, 64, 14, 0.3)'],
                backgroundColor: ['rgba(120, 53, 15, 0.1)', 'rgba(120, 53, 15, 0.2)', 'rgba(120, 53, 15, 0.1)']
              }
            : {}
        }
        transition={{ duration: 0.8 }}
      >
        <p className="text-amber-100 italic font-serif text-lg leading-relaxed">
          "{data.riddle}"
        </p>
      </motion.div>
      
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Your Answer:</div>
        <Input
          className="bg-gray-900 border-gray-700 focus:border-amber-700 text-white"
          placeholder="Enter your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && answer.trim()) {
              handleSubmit();
            }
          }}
        />
      </div>
      
      <Button 
        variant="outline" 
        className="w-full border-amber-900/50 hover:bg-amber-900/20 text-amber-400"
        onClick={handleSubmit}
        disabled={!answer.trim() || isAnimating}
      >
        Submit Answer
      </Button>
      
      {!data.caseSensitive && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Note: This riddle is not case-sensitive.
        </div>
      )}
    </div>
  );
}