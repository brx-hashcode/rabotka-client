import { Mail, MapPin, Phone } from "lucide-react";

import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { whatsappLinkTo } from "@/config";
import { supportContent } from "@/content/support";
import { usePublicContact } from "@/hooks/use-public-contact";

const content = supportContent.drawer;

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Prefilled WhatsApp text. Callers pass the reason they opened it — a
   * suspended worker and a curious one should not send support the same
   * sentence.
   */
  message?: string;
}>;

/**
 * Support coordinates, as a bottom sheet.
 *
 * Every number and address comes from SystemConfig (`contact.*`) so support can
 * be repointed from the admin without a deploy — nothing here is hardcoded.
 * The WhatsApp CTA targets that same `contact.phone`.
 */
export function SupportContactDrawer({ open, onOpenChange, message }: Props) {
  // `enabled` is not set: the query is cheap, cached five minutes, and already
  // warm on any screen that rendered the landing footer.
  const { data: contact, isLoading } = usePublicContact();

  const phone = contact?.phone?.trim() ?? "";
  const email = contact?.email?.trim() ?? "";
  const address = contact?.address?.trim() ?? "";
  const hasAny = Boolean(phone || email || address);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto flex max-h-[85vh] w-full max-w-md flex-col">
          <DrawerHeader className="text-center">
            <DrawerTitle>{content.title}</DrawerTitle>
            <DrawerDescription>{content.description}</DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-2">
            {isLoading && (
              <>
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </>
            )}

            {!isLoading && !hasAny && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {content.unavailable}
              </p>
            )}

            {!isLoading && phone && (
              <ContactRow
                icon={<Phone className="h-4 w-4 text-whatsapp" />}
                label={content.phoneLabel}
                value={phone}
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              />
            )}
            {!isLoading && email && (
              <ContactRow
                icon={<Mail className="h-4 w-4 text-whatsapp" />}
                label={content.emailLabel}
                value={email}
                href={`mailto:${email}`}
              />
            )}
            {!isLoading && address && (
              <ContactRow
                icon={<MapPin className="h-4 w-4 text-whatsapp" />}
                label={content.addressLabel}
                value={address}
              />
            )}
          </div>

          <DrawerFooter>
            {/* An <a> styled as the button, not a Button with onClick: WhatsApp
                opens through the OS, and a scripted window.open is what mobile
                popup blockers eat. */}
            <Button
              asChild
              className="bg-whatsapp text-white hover:bg-whatsapp active:bg-whatsapp-dark"
            >
              <a
                href={whatsappLinkTo(
                  phone,
                  message ?? supportContent.defaultMessage,
                )}
                target="_blank"
                rel="noreferrer"
              >
                {/* The brand mark, not a speech bubble: this button leaves the
                    app for WhatsApp, and a generic bubble reads as in-app
                    chat. Same icon `contacted-profiles` already uses. */}
                <WhatsAppIcon className="mr-2 size-4" />
                {content.whatsappCta}
              </a>
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">{content.close}</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}>) {
  const body = (
    <>
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-medium text-foreground">
          {value}
        </p>
      </div>
    </>
  );

  if (!href) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-card p-3 shadow-soft">
        {body}
      </div>
    );
  }

  return (
    <a
      href={href}
      className="flex items-start gap-3 rounded-xl bg-card p-3 shadow-soft active:bg-muted"
    >
      {body}
    </a>
  );
}
