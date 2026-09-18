import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import https from "https";
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

// =====================================================
// CALCTAF CAMPO
// /coleta        -> Frontend / LoginColeta
// /coleta/*      -> API protegida
// =====================================================

app.get("/coleta", (req, res) => {

  res.sendFile(
    path.join(frontendDist, "index.html")
  );

});

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

const httpsOptions = {
  key: fs.readFileSync(
    path.resolve(__dirname, "../../certs/calctaf-key.pem")
  ),

  cert: fs.readFileSync(
    path.resolve(__dirname, "../../certs/calctaf.pem")
  ),
};

https.createServer(httpsOptions, app).listen(PORT, () => {

  console.log(
    `Servidor HTTPS rodando na porta ${PORT}`
  );

});