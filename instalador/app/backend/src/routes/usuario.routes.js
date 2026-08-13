import { Router } from "express";

import auth from "../middlewares/auth.middleware.js";
import autorizar from "../middlewares/permissao.middleware.js";

import {

  listarUsuarios,

  criarUsuario,

  atualizarUsuario,

  excluirUsuario

} from "../controllers/usuario.controller.js";

const router = Router();

router.get(

  "/",

  auth,

  autorizar(

    "GERAL",

    "ADMINISTRADOR"

  ),

  listarUsuarios

);

router.post(

  "/",

  auth,

  autorizar(

    "GERAL",

    "ADMINISTRADOR"

  ),

  criarUsuario

);

router.put(

  "/:id",

  auth,

  autorizar(

    "GERAL",

    "ADMINISTRADOR"

  ),

  atualizarUsuario

);

router.delete(

  "/:id",

  auth,

  autorizar(

    "GERAL",

    "ADMINISTRADOR"

  ),

  excluirUsuario

);

export default router;