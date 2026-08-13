import { Router } from "express";

import {

  importarAvaliacoesCampo

} from "../controllers/importacao.controller.js";

const router = Router();

router.post(

  "/avaliacoes",

  importarAvaliacoesCampo

);

export default router;