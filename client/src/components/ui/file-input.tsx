import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string | undefined;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, label, helperText, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={props.id} className="mb-2 block text-base">
            {label}
          </Label>
        )}
        <input
          type="file"
          className={cn(
            "block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4",
            "file:rounded-md file:border-0 file:text-sm file:font-semibold",
            "file:bg-primary file:text-primary-foreground",
            "hover:file:bg-primary/90 cursor-pointer",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {(helperText || error) && (
          <p className={cn(
            "mt-1 text-sm",
            error ? "text-destructive" : "text-muted-foreground"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };