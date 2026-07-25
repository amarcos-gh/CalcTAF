import { Router } from "express";

import {
  criarAvaliacao,
  atualizarAvaliacao,
  listarAvaliacoes,
  limparAvaliacoesDuplicadas
} from "../controllers/avaliacao.controller.js";

const router = Router();

router.post("/", criarAvaliacao);

router.put("/:id", atualizarAvaliacao);

router.get("/", listarAvaliacoes);

router.delete(

"/duplicadas",

limparAvaliacoesDuplicadas
);

export default router;