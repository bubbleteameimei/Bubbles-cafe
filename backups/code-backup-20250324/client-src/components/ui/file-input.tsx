import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string | undefined;
  onClear?: () => void;
  selectedFileName?: string;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, label, helperText, error, onClear, selectedFileName, ...props }, ref) => {
    const [fileName, setFileName] = React.useState<string | undefined>(selectedFileName);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    // Pass the forwarded ref to the internal ref
    React.useImperativeHandle(ref, () => fileInputRef.current!);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setFileName(files[0].name);
      } else {
        setFileName(undefined);
      }
      
      // Call the original onChange handler if it exists
      if (props.onChange) {
        props.onChange(e);
      }
    };
    
    const handleClear = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFileName(undefined);
      
      // Call the onClear prop if provided
      if (onClear) {
        onClear();
      }
    };
    
    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={props.id} className="mb-2 block text-base">
            {label}
          </Label>
        )}
        
        <div className="relative">
          {/* Hidden file input */}
          <input
            type="file"
            className="sr-only"
            ref={fileInputRef}
            onChange={handleFileChange}
            id={props.id}
            accept={props.accept}
            disabled={props.disabled}
          />
          
          {/* Custom styled button and file name display */}
          <div 
            className={cn(
              "flex items-center border border-input rounded-md overflow-hidden",
              "hover:bg-accent hover:text-accent-foreground",
              error && "border-destructive focus-within:ring-destructive",
              props.disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            <Button 
              type="button"
              variant="ghost"
              className={cn(
                "h-10 px-4 py-2 bg-muted rounded-none",
                "hover:bg-primary hover:text-primary-foreground",
                "focus:bg-primary focus:text-primary-foreground"
              )}
              onClick={() => !props.disabled && fileInputRef.current?.click()}
              disabled={props.disabled}
            >
              <Upload className="mr-2 h-4 w-4" />
              Browse
            </Button>
            
            <div className="px-3 py-2 flex-grow overflow-hidden whitespace-nowrap text-ellipsis text-sm">
              {fileName || "No file selected"}
            </div>
            
            {fileName && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-none"
                onClick={handleClear}
                disabled={props.disabled}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear</span>
              </Button>
            )}
          </div>
        </div>
        
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