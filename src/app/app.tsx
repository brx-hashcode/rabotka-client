import { BrowserRouter } from "react-router";
import { Providers } from "./providers";
import { AppRoutes } from "./routes";

const App = () => (
  <Providers>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </Providers>
);

export default App;
