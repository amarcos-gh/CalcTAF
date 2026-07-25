import express from "express";

import cors from "cors";

import militarRoutes from "./routes/militar.routes.js";

import campanhaRoutes from "./routes/campanha.routes.js";

import avaliacaoRoutes from "./routes/avaliacao.routes.js";

import subunidadeRoutes from "./routes/subunidade.routes.js";

import omRoutes from "./routes/om.routes.js";

import authRoutes from "./routes/auth.routes.js";

import coletaRoutes from "./routes/coleta/coleta.routes.js";

import importacaoRoutes from "./routes/importacao.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/militares", militarRoutes);

app.use("/subunidades", subunidadeRoutes);

app.use("/campanhas", campanhaRoutes);

app.use("/avaliacoes", avaliacaoRoutes);

app.use("/oms", omRoutes);

app.use("/auth", authRoutes);

app.use("/coleta", coletaRoutes);

app.use("/importacao", importacaoRoutes);

const PORT = 3000;

app.listen(PORT, () => {

  console.log(

    `Servidor rodando na porta ${PORT}`
  );
});