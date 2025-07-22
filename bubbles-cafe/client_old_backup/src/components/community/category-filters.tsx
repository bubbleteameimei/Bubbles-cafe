import * as React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

// Simplified theme categories for search filters only
const SIMPLIFIED_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "PSYCHOLOGICAL", label: "Psychological" },
  { value: "SUPERNATURAL", label: "Supernatural" },
  { value: "TECHNOLOGICAL", label: "Technological" },
  { value: "BODY_HORROR", label: "Body Horror" },
  { value: "GOTHIC", label: "Gothic" },
  { value: "APOCALYPTIC", label: "Apocalyptic" }
];

interface CategoryFiltersProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CategoryFilters({ value, onChange, className = "" }: CategoryFiltersProps) {
  return (
    <div className={`w-full md:w-[180px] ${className}`}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {SIMPLIFIED_CATEGORIES.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}