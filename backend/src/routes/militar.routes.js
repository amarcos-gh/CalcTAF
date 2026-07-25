import { Router } from "express";

import auth from "../middlewares/auth.middleware.js";
import autorizar from "../middlewares/permissao.middleware.js";

import {
  criarMilitar,
  excluirMilitar,
  atualizarMilitar,
  listarMilitares
} from "../controllers/militar.controller.js";

const router = Router();

router.post(
  "/",
  auth,
  autorizar("ADMINISTRADOR", "OPERADOR"),
  criarMilitar
);

router.put(
  "/:id",
  auth,
  autorizar("ADMINISTRADOR", "OPERADOR"),
  atualizarMilitar
);

router.delete(
  "/:id",
  auth,
  autorizar("ADMINISTRADOR", "OPERADOR"),
  excluirMilitar
);

router.get(
  "/",
  auth,
  autorizar("ADMINISTRADOR", "OPERADOR"),
  listarMilitares
);

export default router;