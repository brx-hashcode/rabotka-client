import { useNavigate } from "react-router";
import { Card } from "@/components/ui/card";
import { cn, formatDateTime } from "@/lib/utils";
import type { ClaimItem } from "@/lib/api/claims-controller";

const getStatusColor = (status: string) => {
  return cn(
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
    {
      "bg-yellow-100 text-yellow-800": status === "CREATED",
      "bg-blue-100 text-blue-800": status === "IN_PROGRESS",
      "bg-green-100 text-green-800": status === "COMPLETED",
      "bg-red-100 text-red-800": status === "REJECTED",
    },
  );
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    CREATED: "Créée",
    IN_PROGRESS: "En Cours",
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
    <Card
      onClick={() => navigate(`/claims/${claim.id}`)}
      className="p-4 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
          {claim.title}
        </h3>
        <span className={getStatusColor(claim.status)}>
          {getStatusLabel(claim.status)}
        </span>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {claim.description}
      </p>

      {claim.attachmentUrls.length > 0 && (
        <div className="mb-3 flex gap-1">
          {claim.attachmentUrls.map((url, idx) => (
            <div
              key={`${url}-${idx + 1}`}
              className="h-8 w-8 rounded border border-border bg-muted overflow-hidden"
            >
              <img
                src={url}
                alt={`Attachment ${idx}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {formatDateTime(claim.createdAt)}
      </p>
    </Card>
  );
};
