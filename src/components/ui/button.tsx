import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background cursor-pointer transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-whatsapp text-primary-foreground hover:bg-whatsapp-dark",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Flat tinted counterpart of `outline`, for secondary destructive actions.
        "destructive-soft": "bg-destructive/10 text-destructive shadow-none hover:bg-destructive/20",
        outline: "bg-whatsapp/10 text-whatsapp shadow-none hover:bg-whatsapp/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        whatsapp: "bg-whatsapp text-primary-foreground hover:bg-whatsapp-dark",
        "whatsapp-outline": "border-2 border-whatsapp bg-transparent text-whatsapp transition-[background-color,color] hover:bg-whatsapp hover:text-primary-foreground",
        hero: "bg-whatsapp text-primary-foreground shadow-sm hover:bg-whatsapp-dark text-base",
        "hero-outline": "border-2 border-whatsapp bg-card/80 text-whatsapp backdrop-blur-sm text-base transition-[background-color,color] hover:bg-whatsapp hover:text-primary-foreground",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-14 px-8 text-base",
        xl: "h-16 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
