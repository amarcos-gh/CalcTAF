import { Router } from "express";

import {

  listarOMs,

  selecionarOM

} from "../controllers/om.controller.js";

const router = Router();

router.get(

  "/",

  listarOMs
);

router.post(

  "/selecionar",

  selecionarOM
);

export default router;