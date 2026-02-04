import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type InfoIconProps = {
  tooltipText: string;
  imageSrc: string;
  imageAlt: string;
};

export function InfoIcon({
  tooltipText,
  imageSrc,
  imageAlt,
}: Readonly<InfoIconProps>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={tooltipText}
          className="inline-flex cursor-help items-center justify-center rounded-full p-0.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
        >
          <Info className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm p-0 overflow-hidden">
        <div className="p-2 space-y-2">
          <p className="text-sm">{tooltipText}</p>
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full max-h-48 object-contain rounded-lg border border-gray-200"
          />
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
