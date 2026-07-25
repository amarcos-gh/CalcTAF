import express from "express";
import cors from "cors";

import militarRoutes from "./routes/militar.routes.js";
import avaliacaoRoutes from "./routes/avaliacao.routes.js";
import campanhaRoutes from "./routes/campanha.routes.js";
import importacaoRoutes from "./routes/importacao.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/militares", militarRoutes);

app.use("/avaliacoes", avaliacaoRoutes);

app.use("/campanhas", campanhaRoutes);

app.use("/importacao", importacaoRoutes);

export default app;