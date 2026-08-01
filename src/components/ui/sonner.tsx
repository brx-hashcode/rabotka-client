import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Pinned to the light theme on purpose. The app ships light-only (nothing ever
 * applies the `.dark` class), so deriving this from next-themes just resolved
 * "system" and rendered sonner's black dark-mode toast on devices set to dark.
 */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    className="toaster group"
    toastOptions={{
      classNames: {
        toast:
          "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-none group-[.toaster]:shadow-soft group-[.toaster]:rounded-lg",
        description: "group-[.toast]:text-muted-foreground",
        actionButton:
          "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButton:
          "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        error: "group-[.toaster]:text-destructive",
      },
    }}
    {...props}
  />
);

export { Toaster, toast };
