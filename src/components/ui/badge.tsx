import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Status chips in the agent app's style: tinted pills, no border. */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-lime-foreground/25",
  {
    variants: {
      variant: {
        default: "bg-chip-green text-chip-green-foreground",
        secondary: "bg-lime/60 text-lime-foreground",
        success: "bg-chip-green text-chip-green-foreground",
        warning: "bg-chip-amber text-chip-amber-foreground",
        violet: "bg-chip-violet text-chip-violet-foreground",
        destructive: "bg-destructive/10 text-destructive",
        outline: "bg-secondary text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
