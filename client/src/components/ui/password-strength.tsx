import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  className?: string;
  onStrengthChange?: (strength: 'weak' | 'fair' | 'good' | 'strong') => void;
}

export function PasswordStrength({ password, className, onStrengthChange }: PasswordStrengthProps) {
  const [strength, setStrength] = useState<'weak' | 'fair' | 'good' | 'strong'>('weak');
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!password) {
      setStrength('weak');
      setScore(0);
      onStrengthChange?.('weak');
      return;
    }

    let newScore = 0;
    const checks = {
      length: password.length >= 8,
      complexity: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      noCommon: !['password', '123456', 'qwerty', 'letmein'].some(common => 
        password.toLowerCase().includes(common)
      )
    };

    // Calculate score (max 4)
    newScore = Object.values(checks).filter(Boolean).length;
    setScore(newScore);

    // Determine strength level
    let newStrength: 'weak' | 'fair' | 'good' | 'strong';
    if (newScore <= 1) newStrength = 'weak';
    else if (newScore === 2) newStrength = 'fair';
    else if (newScore === 3) newStrength = 'good';
    else newStrength = 'strong';

    setStrength(newStrength);
    onStrengthChange?.(newStrength);
  }, [password, onStrengthChange]);

  if (!password) return null;

  const strengthConfig = {
    weak: { 
      color: 'bg-red-500', 
      text: 'Weak', 
      textColor: 'text-red-600',
      icon: ShieldX,
      width: '25%'
    },
    fair: { 
      color: 'bg-orange-500', 
      text: 'Fair', 
      textColor: 'text-orange-600',
      icon: Shield,
      width: '50%'
    },
    good: { 
      color: 'bg-blue-500', 
      text: 'Good', 
      textColor: 'text-blue-600',
      icon: Shield,
      width: '75%'
    },
    strong: { 
      color: 'bg-green-500', 
      text: 'Strong', 
      textColor: 'text-green-600',
      icon: ShieldCheck,
      width: '100%'
    }
  };

  const config = strengthConfig[strength];
  const Icon = config.icon;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength indicator bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500 ease-out", config.color)}
          style={{ width: config.width }}
        />
      </div>
      
      {/* Strength label with icon */}
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", config.textColor)} />
        <span className={cn("text-sm font-medium", config.textColor)}>
          Password strength: {config.text}
        </span>
      </div>

      {/* Simple improvement suggestion */}
      {strength === 'weak' && (
        <p className="text-xs text-muted-foreground">
          Try making it longer with a mix of letters, numbers, and symbols
        </p>
      )}
      
      {strength === 'fair' && (
        <p className="text-xs text-muted-foreground">
          Add some symbols or make it longer for better security
        </p>
      )}
    </div>
  );
}