import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The raised look: a one-pixel highlight along the top edge that flips into a
 * one-pixel shadow on press, so the button reads as sinking in rather than
 * just changing colour.
 *
 * Ported from rabotka-admin, and it used to be on every button with a surface.
 * IT IS NOW THE LANDING HERO'S ALONE. In the app it made every primary look
 * lit from within — fine once, plastic on a card repeating down a feed — and
 * it fought this app's own flat, borderless house style. The hero is one
 * button on a marketing page with room to be showy, so it keeps it.
 *
 * Every other button still answers a thumb: the press shrink is in the shared
 * base below, not here.
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
    // Pills, like the agent app: cards, chips and buttons are one family.
    "relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background",
    // Background, shadow, filter and transform together: the press animates
    // all four, and listing only colours would make the rest snap.
    "transition-[background-color,box-shadow,filter,transform,color] duration-200 ease-out",
    // The press is a slight shrink, the same as the home cards — what a
    // native app does under a thumb — rather than a nudge down.
    "active:scale-[0.97]",
    "motion-reduce:transition-none motion-reduce:active:scale-100",
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
        // The primary: ONE FLAT GREEN. No gradient, no glow underneath, no
        // inset highlight along the top.
        //
        // It had all three, and together they made every primary button look
        // lit from within. On a card that repeats down a feed it read as
        // plastic, and the glow in particular bled a green halo onto the
        // surface behind it, which is why two of these side by side looked
        // heavier than the sum of their parts. Flat is this app's house
        // style — borderless surfaces, `shadow-soft`, no gradients — and the
        // button was the last thing not following it.
        //
        // The press stays (the shrink lives in the shared base), so the
        // button still answers a thumb. What is gone is the decoration it
        // wore at rest.
        default: "bg-whatsapp text-primary-foreground hover:brightness-95",
        whatsapp: "bg-whatsapp text-primary-foreground hover:brightness-95",
        // The landing hero keeps its depth. It is one button on a marketing
        // page with room to be showy, not one of a pair on a card in a feed.
        hero: `bg-linear-to-b from-whatsapp to-whatsapp-dark text-base text-primary-foreground shadow-nav-selected hover:brightness-95 ${RAISED}`,
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-95",

        // Tinted and neutral surfaces. BORDERLESS, as this app has always had
        // them, and now flat like the primary above — a secondary that still
        // wore an inset highlight after the primary lost its gradient was the
        // odd one out in exactly the pair this change exists to settle.
        outline:
          "bg-whatsapp/10 text-whatsapp hover:bg-whatsapp/15 active:bg-whatsapp/20",
        "destructive-soft":
          "bg-destructive/10 text-destructive hover:bg-destructive/15 active:bg-destructive/20",
        // The agent app's secondary: a light lime pill with its dark-green
        // ink (it was the old beige, which looked muddy beside the lime).
        secondary:
          "bg-lime/60 text-lime-foreground hover:bg-lime/80",

        // These two had a border before this change and keep it: they sit on
        // photos and coloured heroes, where a tint alone disappears.
        "whatsapp-outline":
          "border-2 border-whatsapp bg-transparent text-whatsapp hover:bg-whatsapp hover:text-primary-foreground",
        "hero-outline":
          "border-2 border-whatsapp bg-card/80 text-base text-whatsapp backdrop-blur-sm hover:bg-whatsapp hover:text-primary-foreground",

        // No surface, so no depth: a raised ghost or a raised link is a
        // contradiction.
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline active:scale-100",
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
