import { useNavigate } from "react-router";
import { Calendar } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import type { ClaimItem } from "@/lib/api/claims-controller";

const statusPill = (status: string) =>
  cn(
    "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
    {
      "bg-yellow-100 text-yellow-800": status === "CREATED",
      "bg-blue-100 text-blue-800": status === "IN_PROGRESS",
      "bg-green-100 text-green-800": status === "COMPLETED",
      "bg-red-100 text-red-800": status === "REJECTED",
    },
  );

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    CREATED: "Créée",
    IN_PROGRESS: "En cours",
    COMPLETED: "Complétée",
    REJECTED: "Rejetée",
  };
  return labels[status] || status;
};

type ClaimCardProps = {
  claim: ClaimItem;
};

export const ClaimCard = ({ claim }: ClaimCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/claims/${claim.id}`)}
      className="w-full rounded-xl bg-card p-4 text-left shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 font-semibold leading-snug text-foreground line-clamp-2">
          {claim.title}
        </h3>
        <span className={statusPill(claim.status)}>
          {statusLabel(claim.status)}
        </span>
      </div>

      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
        {claim.description}
      </p>

      {claim.attachmentUrls.length > 0 && (
        <div className="mt-3 flex gap-1.5">
          {claim.attachmentUrls.slice(0, 4).map((url, idx) => (
            <div
              key={`${url}-${idx + 1}`}
              className="h-9 w-9 overflow-hidden rounded-lg bg-muted"
            >
              <img
                src={url}
                alt={`Pièce jointe ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        {formatDateTime(claim.createdAt)}
      </p>
    </button>
  );
};
