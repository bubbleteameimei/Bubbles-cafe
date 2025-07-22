import * as React from "react"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SelectDemo() {
  const [theme, setTheme] = React.useState("dark")
  
  const handleThemeChange = (value: string) => {
    setTheme(value)
    toast.success("Theme updated!", {
      description: `Theme changed to ${value} mode.`,
    })
  }
  
  return (
    <Select value={theme} onValueChange={handleThemeChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Theme Options</SelectLabel>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
          <SelectItem value="horror">Horror</SelectItem>
          <SelectItem value="sepia">Sepia</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}