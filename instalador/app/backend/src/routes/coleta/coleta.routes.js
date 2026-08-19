import { Router } from "express";

import {
  buscarMilitares,
  buscarChamada,
  exportarColeta,
  importarResultados,
  buscarHistorico
} from "../../controllers/coleta/coleta.controller.js";

import auth from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(auth);

router.get(
  "/militares",
  buscarMilitares
);

router.get(
  "/chamada",
  buscarChamada
);

router.get(
  "/exportar",
  exportarColeta
);

router.post(
  "/importar",
  importarResultados
);

router.get(
  "/historico",
  buscarHistorico
);


export default router;