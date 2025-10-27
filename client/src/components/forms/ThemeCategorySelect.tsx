
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { THEME_CATEGORIES } from "@shared/theme-categories";

interface ThemeCategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ThemeCategorySelect({ value, onChange }: ThemeCategorySelectProps) {
  const options = React.useMemo(() => {
    try {
      return Object.entries(THEME_CATEGORIES)
        .map(([key, info]) => ({ key, label: (info as any)?.label || key }))
        .sort((a, b) => a.label.localeCompare(b.label));
    } catch {
      return [];
    }
  }, []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a theme category" />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.key} value={opt.key}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
