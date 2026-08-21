import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

type InfoCardProps = {
  label: string;
  icon: LucideIcon;
  value: string;
  colSpan?: 1 | 2;
  variant?: "default" | "green" | "red";
  children?: ReactNode;
};

export function InfoCard({
  label,
  icon: Icon,
  value,
  colSpan = 1,
  variant = "default",
  children,
}: Readonly<InfoCardProps>) {
  // Borderless by house style: a soft shadow lifts the card off the page
  // instead. Rounding and padding live on the wrapper below, not here -- the
  // default variant used to repeat both, and the duplicate rounded-lg/rounded-xl
  // pair resolved by stylesheet order rather than by intent.
  const bgClassesMap = {
    green: "bg-gradient-to-br from-green-50 to-green-100/50",
    red: "bg-gradient-to-br from-red-50 to-red-100/50",
    default: "bg-card",
  } as const;
  const bgClasses = bgClassesMap[variant];

  const iconBgMap = {
    green: "bg-green-100",
    red: "bg-red-100",
    default: "bg-green-50",
  } as const;
  const iconBgClasses = iconBgMap[variant];

  const iconColorMap = {
    green: "text-green-600",
    red: "text-red-600",
    default: "text-gray-600",
  } as const;
  const iconColorClasses = iconColorMap[variant];

  return (
    <div
      className={`relative ${bgClasses} shadow-soft rounded-lg p-4 ${
        colSpan === 2 ? "md:col-span-2" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 bg-white rounded-lg ${iconBgClasses}`}>
          <Icon className={`size-5 ${iconColorClasses}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {label}
          </p>
          {children || (
            <p className="text-sm  break-words">{value || "Non renseigné"}</p>
          )}
        </div>
      </div>
    </div>
  );
}
