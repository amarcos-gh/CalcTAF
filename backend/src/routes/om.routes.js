import { Router } from "express";

import auth from "../middlewares/auth.middleware.js";
import autorizar from "../middlewares/permissao.middleware.js";

import {

  listarOMs,

  selecionarOM,

  criarOM,

  atualizarOM,

  excluirOM

} from "../controllers/om.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| ROTAS UTILIZADAS PELO LOGIN
|--------------------------------------------------------------------------
*/

router.get(

  "/",

  listarOMs

);

router.post(

  "/selecionar",

  selecionarOM

);

/*
|--------------------------------------------------------------------------
| ROTAS ADMINISTRATIVAS
|--------------------------------------------------------------------------
*/

router.post(

  "/",

  auth,

  autorizar(

    "GERAL"

  ),

  criarOM

);

router.put(

  "/:id",

  auth,

  autorizar(

    "GERAL"

  ),

  atualizarOM

);

router.delete(

  "/:id",

  auth,

  autorizar(

    "GERAL"

  ),

  excluirOM

);

export default router;