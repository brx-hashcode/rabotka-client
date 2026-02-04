import { Routes, Route } from "react-router";
import Index from "@/pages/index";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
