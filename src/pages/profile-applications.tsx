import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardList } from "lucide-react";

export default function ProfileApplications() {
  return (
    <div className="pt-24 lg:pt-28 pb-8 px-4 md:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/profile">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Mes candidatures</h1>
        </div>

        {/* Coming Soon Content */}
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="bg-muted rounded-full p-6">
            <ClipboardList className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Bientôt disponible
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            La liste de vos candidatures sera disponible prochainement. Vous
            pourrez suivre l'état de vos candidatures ici.
          </p>
          <Button variant="outline" asChild>
            <Link to="/profile">Retour au profil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
