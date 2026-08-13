import { Router } from "express";

import {

  buscarMilitares,

  buscarChamada,

  exportarColeta,

  importarResultados

} from "../../controllers/coleta/coleta.controller.js";

const router = Router();

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

export default router;