
import * as React from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ThemeCategorySelect } from "./ThemeCategorySelect";
import { Control } from "react-hook-form";

interface PostFormThemeFieldProps {
  control: Control<any>;
}

export function PostFormThemeField({ control }: PostFormThemeFieldProps) {
  return (
    <FormField
      control={control}
      name="themeCategory"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Theme Category</FormLabel>
          <FormControl>
            <ThemeCategorySelect 
              value={field.value} 
              onChange={field.onChange} 
            />
          </FormControl>
          <FormDescription>
            Select the primary theme category for your story.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
