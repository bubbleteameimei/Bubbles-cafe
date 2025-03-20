
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ThemeCategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ThemeCategorySelect({ value, onChange }: ThemeCategorySelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a theme category" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Classic Horror</SelectLabel>
          <SelectItem value="gothic">Gothic Horror</SelectItem>
          <SelectItem value="supernatural">Supernatural</SelectItem>
          <SelectItem value="monster">Monster Stories</SelectItem>
          <SelectItem value="cosmic">Cosmic Horror</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Psychological</SelectLabel>
          <SelectItem value="psychological">Psychological Horror</SelectItem>
          <SelectItem value="suspense">Suspense & Thriller</SelectItem>
          <SelectItem value="mystery">Mystery</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Modern</SelectLabel>
          <SelectItem value="urban">Urban Legends</SelectItem>
          <SelectItem value="tech">Tech Horror</SelectItem>
          <SelectItem value="body">Body Horror</SelectItem>
          <SelectItem value="folk">Folk Horror</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Speculative</SelectLabel>
          <SelectItem value="dystopian">Dystopian</SelectItem>
          <SelectItem value="apocalyptic">Apocalyptic</SelectItem>
          <SelectItem value="scifi">Sci-Fi Horror</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
