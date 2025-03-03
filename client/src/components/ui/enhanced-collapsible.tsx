
"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface EnhancedCollapsibleProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
  variant?: "default" | "bordered" | "card" | "elegant"
  icon?: "chevron" | "plus" | "none"
}

export function EnhancedCollapsible({
  title,
  children,
  defaultOpen = false,
  className,
  triggerClassName,
  contentClassName,
  variant = "default",
  icon = "chevron"
}: EnhancedCollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  
  const containerStyles = cn(
    "w-full transition-all duration-200",
    variant === "bordered" && "border rounded-md overflow-hidden",
    variant === "card" && "bg-card rounded-lg shadow-sm",
    variant === "elegant" && "bg-background/60 backdrop-blur-sm rounded-xl shadow-md border",
    className
  )
  
  const triggerStyles = cn(
    "flex w-full items-center justify-between py-3",
    variant === "default" && "px-1 border-b",
    variant === "bordered" && "px-4 bg-muted/50 hover:bg-muted/80 font-medium",
    variant === "card" && "px-4 bg-card hover:bg-muted/10 font-medium",
    variant === "elegant" && "px-6 py-4 font-semibold text-foreground/90",
    triggerClassName
  )
  
  const contentStyles = cn(
    "w-full overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    variant === "default" && "px-1 pt-2 pb-4",
    variant === "bordered" && "px-4 py-3",
    variant === "card" && "px-4 py-3",
    variant === "elegant" && "px-6 py-4 text-foreground/80",
    contentClassName
  )

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={containerStyles}
    >
      <div className="w-full">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className={triggerStyles}>
            <span className="text-left flex-grow">{title}</span>
            {icon === "chevron" && (
              <ChevronsUpDown className={cn("h-4 w-4 shrink-0 transition-transform duration-300", isOpen && "rotate-180")} />
            )}
            {icon === "plus" && (
              isOpen ? <Minus className="h-4 w-4 shrink-0 transition-transform duration-300" /> 
                    : <Plus className="h-4 w-4 shrink-0 transition-transform duration-300" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className={contentStyles}>
        <div className="w-full">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
