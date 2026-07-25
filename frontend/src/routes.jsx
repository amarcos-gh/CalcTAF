import ExportarColeta from "./pages/ExportarColeta";
import Relatorios
from "./pages/Relatorios/Relatorios";

<Routes>

  <Route
    path="/"
    element={<Home />}
  />

  <Route
    path="/militares"
    element={<Militares />}
  />

  <Route
    path="/avaliacoes"
    element={<Avaliacoes />}
  />

  <Route
    path="/coletas"
    element={<ExportarColeta />}
  />

  <Route
    path="/relatorios"
    element={<Relatorios />}
  />

</Routes>