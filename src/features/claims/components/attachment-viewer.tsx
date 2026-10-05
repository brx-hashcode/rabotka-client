import { Download } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { fileNameFromUrl } from "@/lib/image-upload";

/**
 * A full-width look at one attachment.
 *
 * Deliberately small. `rabotka-admin` has a 991-line `DocumentViewerDrawer`
 * with zoom, rotate, print and PDF/DOCX renderers — that is a desktop review
 * tool. Here the need is "see the photo bigger on a phone", and the app has no
 * viewer at all today, so this adds the least that answers it.
 *
 * A Drawer rather than a Dialog to match every other sheet in this feature.
 */
export function AttachmentViewer({
  url,
  onOpenChange,
}: Readonly<{
  url: string | null;
  onOpenChange: (open: boolean) => void;
}>) {
  return (
    <Drawer open={url !== null} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto flex max-h-[90vh] w-full flex-col">
          <DrawerHeader className="text-left">
            <DrawerTitle className="truncate text-base">
              {url ? fileNameFromUrl(url, "Pièce jointe") : "Pièce jointe"}
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-1 items-center justify-center overflow-hidden bg-neutral-900 px-2 py-3">
            {url && (
              <img
                src={url}
                alt=""
                // `object-contain`: a claim photo is evidence, and cropping it
                // to fill the box can cut out the thing being reported.
                className="max-h-[60vh] w-auto max-w-full object-contain"
              />
            )}
          </div>

          <DrawerFooter className="flex-row gap-2">
            {url && (
              <Button asChild variant="outline" className="flex-1">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 size-4" />
                  Ouvrir
                </a>
              </Button>
            )}
            <DrawerClose asChild>
              <Button className="flex-1">Fermer</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
