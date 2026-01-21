import { Routes, Route } from "react-router-dom";
import Index from "@/pages/index";
import NotFound from "@/pages/not-found";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
