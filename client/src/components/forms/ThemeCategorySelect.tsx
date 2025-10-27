
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { THEME_CATEGORIES } from "@shared/theme-categories";
import { Icon } from "@iconify/react";
import {
  Eye, Ghost, Skull, Brain, Pill, Cpu, Hourglass, Moon, MoonStar,
  Footprints, Box, Car, Radio, Castle, Bug, FlaskConical, Radiation,
  Building, Cat, Flame, Dog, Cloud, AlertTriangle, Trees, ForkKnife
} from "lucide-react";

interface ThemeCategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
}

const getIconCmpForSlug = (slugRaw?: string): React.ComponentType<{ className?: string }> => {
  const slug = String(slugRaw || "").toLowerCase();
  switch (slug) {
    case "eye": return Eye;
    case "ghost": return Ghost;
    case "skull": return Skull;
    case "brain": return Brain;
    case "pill": return Pill;
    case "cpu": return Cpu;
    case "hourglass": return Hourglass;
    case "moon": return Moon;
    case "moon-star":
    case "moonstar": return MoonStar;
    case "footprints": return Footprints;
    case "box": return Box;
    case "car": return Car;
    case "radio": return Radio;
    case "castle": return Castle;
    case "bug": return Bug;
    case "flask": return FlaskConical;
    case "radiation": return Radiation;
    case "building": return Building;
    case "cat": return Cat;
    case "flame": return Flame;
    case "dog": return Dog;
    case "cloud": return Cloud;
    case "alert-triangle":
    case "alerttriangle": return AlertTriangle;
    case "trees":
    case "tree": return Trees;
    case "knife":
    case "fork-knife":
    case "forkknife":
    case "utensils": return ForkKnife;
    default: return Eye;
  }
};

export function ThemeCategorySelect({ value, onChange }: ThemeCategorySelectProps) {
  const options = React.useMemo(() => {
    try {
      return Object.entries(THEME_CATEGORIES)
        .map(([key, info]) => ({ key, label: (info as any)?.label || key, icon: (info as any)?.icon || "eye" }))
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
        {options.map(opt => {
          const iconSlug = String(opt.icon || "").toLowerCase();
          const LucideIcon = getIconCmpForSlug(iconSlug);
          const isIconify = iconSlug.includes(":");
          return (
            <SelectItem key={opt.key} value={opt.key}>
              <div className="flex items-center gap-2">
                {isIconify
                  ? <Icon icon={iconSlug} className="h-4 w-4" />
                  : <LucideIcon className="h-4 w-4" />
                }
                <span>{opt.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
