import { Router } from "express";

import auth from "../middlewares/auth.middleware.js";

import {

  criarAvaliacao,

  atualizarAvaliacao,

  listarAvaliacoes,

  listarLogsAvaliacao,

  limparAvaliacoesDuplicadas,

  calcularAvaliacao

} from "../controllers/avaliacao.controller.js";

const router = Router();

router.post(

  "/calcular",

  calcularAvaliacao

);

router.post(

  "/",

  auth,

  criarAvaliacao

);

router.put(

  "/:id",

  auth,

  atualizarAvaliacao

);

router.get(

  "/",

  auth,

  listarAvaliacoes

);

router.get(

  "/logs",

  auth,

  listarLogsAvaliacao

);

router.delete(

  "/duplicadas",

  auth,

  limparAvaliacoesDuplicadas

);

export default router;