import { useState } from "react";
import { ChevronRight, LifeBuoy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supportContent } from "@/content/support";
import { SupportContactDrawer } from "./support-contact-drawer";

type Props = Readonly<{
  /** Renders as a row inside the profile's action list rather than a button. */
  asRow?: boolean;
  message?: string;
}>;

/** The trigger + its drawer, so a caller only has to drop in one element. */
export function SupportContactButton({ asRow = false, message }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {asRow ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-foreground active:bg-muted"
        >
          <LifeBuoy className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">
            {supportContent.button}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      ) : (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setIsOpen(true)}
        >
          <LifeBuoy className="h-4 w-4" />
          {supportContent.button}
        </Button>
      )}

      <SupportContactDrawer
        open={isOpen}
        onOpenChange={setIsOpen}
        message={message}
      />
    </>
  );
}
