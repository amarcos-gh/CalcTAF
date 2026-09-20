import { Router } from "express";

import auth from "../middlewares/auth.middleware.js";
import autorizar from "../middlewares/permissao.middleware.js";

import {
  criarMilitar,
  excluirMilitar,
  atualizarMilitar,
  listarMilitares,
  importarMilitares
} from "../controllers/militar.controller.js";

const router = Router();

router.post(
  "/",
  auth,
  autorizar("ADMINISTRADOR", "CADASTRADOR"),
  criarMilitar
);

router.put(
  "/:id",
  auth,
  autorizar("ADMINISTRADOR", "CADASTRADOR"),
  atualizarMilitar
);

router.delete(
  "/:id",
  auth,
  autorizar("ADMINISTRADOR", "CADASTRADOR"),
  excluirMilitar
);

router.get(
  "/",
  auth,
  autorizar("ADMINISTRADOR", "CADASTRADOR", "AVALIADOR"),
  listarMilitares
);

router.post(
  "/importar",
  auth,
  autorizar("ADMINISTRADOR", "CADASTRADOR"),
  importarMilitares
);

export default router;