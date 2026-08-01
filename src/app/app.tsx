import { BrowserRouter } from "react-router";
import { Providers } from "./providers";
import { AppRoutes } from "./routes";
import { AdPopup } from "@/features/ads/ad-popup";

const App = () => (
  <Providers>
    <BrowserRouter>
      <AppRoutes />
      {/* Rides along on every route — it picks its own moments to appear. */}
      <AdPopup />
    </BrowserRouter>
  </Providers>
);

export default App;
