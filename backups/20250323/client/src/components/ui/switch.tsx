import * as React from "react"
import { cn } from "@/lib/utils"
import "./switch.css"

/**
 * Custom Switch component that matches the provided design
 * Simple toggle switch based on standard HTML elements
 */
interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, id = "switch-" + Math.random().toString(36).substr(2, 9), ...props }, ref) => {
    // Handle the change event
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
    };

    return (
      <label 
        htmlFor={id} 
        className={cn(
          "relative inline-block w-11 h-6 cursor-pointer",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
      >
        <input 
          type="checkbox"
          id={id}
          className="peer sr-only"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          ref={ref}
          {...props}
        />
        <span 
          className={cn(
            "absolute inset-0 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out",
            "peer-checked:bg-primary dark:bg-neutral-700 dark:peer-checked:bg-primary",
            "peer-disabled:opacity-50 peer-disabled:pointer-events-none"
          )}
          data-state={checked ? "checked" : "unchecked"}
        />
        <span 
          className={cn(
            "absolute top-1/2 start-0.5 -translate-y-1/2 size-5 bg-white rounded-full shadow-xs",
            "transition-transform duration-200 ease-in-out peer-checked:translate-x-full",
            "dark:bg-neutral-400 dark:peer-checked:bg-white"
          )}
          data-state={checked ? "checked" : "unchecked"}
        />
      </label>
    );
  }
);

Switch.displayName = "Switch";

export { Switch }