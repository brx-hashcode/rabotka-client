import { useProfileMe } from "@/hooks/use-profile-me";
import { EmployerHome, WorkerHome } from "@/features/home";

export default function Home() {
  const { data: profile } = useProfileMe();

  if (profile?.profileType === "EMPLOYER") {
    return <EmployerHome />;
  }
  return <WorkerHome />;
}
