import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import omRoutes from "./routes/om.routes.js";
import subunidadeRoutes from "./routes/subunidade.routes.js";
import militarRoutes from "./routes/militar.routes.js";
import campanhaRoutes from "./routes/campanha.routes.js";
import avaliacaoRoutes from "./routes/avaliacao.routes.js";
import coletaRoutes from "./routes/coleta/coleta.routes.js";
import importacaoRoutes from "./routes/importacao.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDist = path.resolve(
  __dirname,
  "../../frontend/dist"
);

const app = express();

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {

  const originalJson = res.json;

  res.json = function (body) {

    console.log(

      `${req.method} ${req.originalUrl} -> ${res.statusCode}`

    );

    return originalJson.call(this, body);

  };

  next();

});

/*
|--------------------------------------------------------------------------
| ROTAS
|--------------------------------------------------------------------------
*/

app.use("/auth", authRoutes);

app.use("/usuarios", usuarioRoutes);

app.use("/oms", omRoutes);

app.use("/subunidades", subunidadeRoutes);

app.use("/militares", militarRoutes);

app.use("/campanhas", campanhaRoutes);

app.use("/avaliacoes", avaliacaoRoutes);

app.use("/coleta", coletaRoutes);

app.use("/importacao", importacaoRoutes);

// =====================================================
// FRONTEND - CalcTAF Campo / Web
// =====================================================

app.use(express.static(frontendDist));

app.use((req, res, next) => {

  if (req.method !== "GET") {
    return next();
  }

  if (!req.accepts("html")) {
    return next();
  }

  res.sendFile(
    path.join(frontendDist, "index.html")
  );

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(

    `Servidor rodando na porta ${PORT}`

  );

});