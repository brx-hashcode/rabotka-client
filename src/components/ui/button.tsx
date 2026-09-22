import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The PRESS, shared by every button that has a surface.
 *
 * Ported from rabotka-admin's button, which is where the product's buttons
 * first got depth: a one-pixel highlight along the top edge, and on press that
 * highlight flips into a one-pixel shadow while the outer glow goes away — the
 * button reads as sinking in rather than just changing colour.
 *
 * Written with plain rgb() where admin uses `--theme(--color-white/16%)`. Both
 * work on this app's Tailwind — checked against the build output, not assumed —
 * and rgb() says what it means to anybody reading it without the Tailwind docs
 * open.
 */
const RAISED =
  "inset-shadow-[0_1px_rgb(255_255_255/0.18)] active:inset-shadow-[0_1px_rgb(0_0_0/0.10)] active:shadow-none disabled:shadow-none";

const buttonVariants = cva(
  [
    "relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background",
    // Background, shadow, filter and transform together: the press animates
    // all four, and listing only colours would make the rest snap.
    "transition-[background-color,box-shadow,filter,transform,color] duration-200 ease-out",
    // A hair of travel on press. Small on purpose — the shadow flip carries the
    // effect, this only makes it feel physical under a thumb.
    "active:translate-y-px",
    "motion-reduce:transition-none motion-reduce:active:translate-y-0",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    // A 44px hit area on touch screens whatever the drawn size, centred on the
    // button — admin's rule, and the one that matters most on a phone, where a
    // `sm` button is otherwise a 36px target under a 45px thumb.
    "pointer-coarse:after:absolute pointer-coarse:after:left-1/2 pointer-coarse:after:top-1/2 pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 pointer-coarse:after:-translate-x-1/2 pointer-coarse:after:-translate-y-1/2",
    "data-loading:select-none",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // The primary. Gradient top to bottom, green glow underneath.
        default: `bg-linear-to-b from-whatsapp to-whatsapp-dark text-primary-foreground shadow-nav-selected hover:brightness-95 ${RAISED}`,
        whatsapp: `bg-linear-to-b from-whatsapp to-whatsapp-dark text-primary-foreground shadow-nav-selected hover:brightness-95 ${RAISED}`,
        hero: `bg-linear-to-b from-whatsapp to-whatsapp-dark text-base text-primary-foreground shadow-nav-selected hover:brightness-95 ${RAISED}`,
        destructive: `bg-destructive text-destructive-foreground shadow-sm shadow-destructive/25 hover:brightness-95 ${RAISED}`,

        // Tinted, and still BORDERLESS — this app's convention, kept on
        // purpose rather than taking admin's bordered outline. They get the
        // same highlight and press, just no glow: a secondary action should
        // not shine like the primary one next to it.
        outline: `bg-whatsapp/10 text-whatsapp hover:bg-whatsapp/15 active:bg-whatsapp/20 ${RAISED}`,
        "destructive-soft": `bg-destructive/10 text-destructive hover:bg-destructive/15 active:bg-destructive/20 ${RAISED}`,
        secondary: `bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/85 ${RAISED}`,

        // These two had a border before this change and keep it: they sit on
        // photos and coloured heroes, where a tint alone disappears.
        "whatsapp-outline":
          "border-2 border-whatsapp bg-transparent text-whatsapp hover:bg-whatsapp hover:text-primary-foreground",
        "hero-outline":
          "border-2 border-whatsapp bg-card/80 text-base text-whatsapp backdrop-blur-sm hover:bg-whatsapp hover:text-primary-foreground",

        // No surface, so no depth: a raised ghost or a raised link is a
        // contradiction.
        ghost: "hover:bg-muted hover:text-foreground active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline active:translate-y-0",
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
  /**
   * Shows a spinner and disables the button, without changing its width.
   *
   * From the admin's button. Replaces the `{isPending && <Loader2 … />}`
   * pattern scattered across screens, which put the spinner BESIDE the label
   * and so made the button grow and every neighbour shift by 24px on tap.
   */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        data-loading={loading ? "" : undefined}
        {...props}
      >
        {/* Slot requires exactly one child, so `asChild` gets its children
            untouched — a DrawerClose-wrapped button does not need a spinner. */}
        {asChild ? (
          children
        ) : (
          <>
            {/* The label stays in the layout but invisible while loading, so the
                button keeps its width. `visibility` rather than a transparent
                text colour, which is what admin does — here the spinner
                inherits the button's colour, and a transparent colour would
                have hidden the spinner along with the label.

                `contents`, so icon and text inside still take the button's own
                `gap`; `visibility` is inherited, so hiding the wrapper hides
                them. */}
            <span className={cn("contents", loading && "invisible")}>
              {children}
            </span>
            {loading && (
              <Loader2 aria-hidden className="absolute animate-spin" />
            )}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
