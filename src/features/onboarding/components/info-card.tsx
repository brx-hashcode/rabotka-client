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
  const isGreen = variant === "green";
  const isRed = variant === "red";
  const bgClasses = isGreen
    ? "bg-gradient-to-br from-green-50 to-green-100/50"
    : isRed
      ? "bg-gradient-to-br from-red-50 to-red-100/50"
      : "bg-gradient-to-br from-gray-50 to-gray-100/50";
  const iconBgClasses = isGreen ? "bg-green-100" : isRed ? "bg-red-100" : "bg-green-50";
  const iconColorClasses = isGreen ? "text-green-600" : isRed ? "text-red-600" : "text-gray-600";

  return (
    <div
      className={`relative ${bgClasses} rounded-xl p-4 ${
        colSpan === 2 ? "md:col-span-2" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 bg-white rounded-lg ${iconBgClasses}`}>
          <Icon className={`size-4 ${iconColorClasses}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
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
