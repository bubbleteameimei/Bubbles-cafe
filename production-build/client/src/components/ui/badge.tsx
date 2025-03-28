import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-primary/20 hover:bg-primary/10",
        ghost: "border-transparent hover:bg-muted/20",
        horror: "border-transparent bg-red-900/20 text-red-400 hover:bg-red-900/30",
        psychological: "border-transparent bg-purple-900/20 text-purple-400 hover:bg-purple-900/30",
        supernatural: "border-transparent bg-blue-900/20 text-blue-400 hover:bg-blue-900/30",
        parasite: "border-transparent bg-green-900/20 text-green-400 hover:bg-green-900/30",
        lovecraftian: "border-transparent bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30",
        cosmic: "border-transparent bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30", // Added for cosmic horror
        suicidal: "border-transparent bg-gray-900/20 text-gray-400 hover:bg-gray-900/30",
        technological: "border-transparent bg-cyan-900/20 text-cyan-400 hover:bg-cyan-900/30",
        body: "border-transparent bg-pink-900/20 text-pink-400 hover:bg-pink-900/30",
        psychopath: "border-transparent bg-red-900/20 text-red-400 hover:bg-red-900/30",
        possession: "border-transparent bg-violet-900/20 text-violet-400 hover:bg-violet-900/30",
        cannibalism: "border-transparent bg-red-950/20 text-red-300 hover:bg-red-950/30",
        stalking: "border-transparent bg-neutral-900/20 text-neutral-400 hover:bg-neutral-900/30",
        death: "border-transparent bg-zinc-900/20 text-zinc-400 hover:bg-zinc-900/30",
        gothic: "border-transparent bg-stone-900/20 text-stone-400 hover:bg-stone-900/30",
        apocalyptic: "border-transparent bg-orange-900/20 text-orange-400 hover:bg-orange-900/30",
        isolation: "border-transparent bg-slate-900/20 text-slate-400 hover:bg-slate-900/30",
        aquatic: "border-transparent bg-blue-950/20 text-blue-300 hover:bg-blue-950/30",
        viral: "border-transparent bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30",
        urban: "border-transparent bg-amber-900/20 text-amber-400 hover:bg-amber-900/30",
        time: "border-transparent bg-fuchsia-900/20 text-fuchsia-400 hover:bg-fuchsia-900/30",
        dreamscape: "border-transparent bg-purple-950/20 text-purple-300 hover:bg-purple-950/30",
        uncanny: "border-transparent bg-teal-900/20 text-teal-400 hover:bg-teal-900/30", // Added for uncanny horror
        existential: "border-transparent bg-gray-800/20 text-gray-300 hover:bg-gray-800/30", // Added for existential horror
        vehicular: "border-transparent bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30", // Added for vehicular horror
        doppelganger: "border-transparent bg-purple-800/20 text-purple-300 hover:bg-purple-800/30", // Added for doppelgänger horror
        slasher: "border-transparent bg-red-800/20 text-red-300 hover:bg-red-800/30", // Added for slasher horror
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }