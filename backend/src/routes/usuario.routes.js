import { Router } from "express";

import auth from "../middlewares/auth.middleware.js";
import autorizar from "../middlewares/permissao.middleware.js";

import {

  listarUsuarios,

  criarUsuario,

  atualizarUsuario,

  excluirUsuario,

  solicitarAcesso,

  listarSolicitacoesAcesso,

  cancelarSolicitacaoAcesso,

  atenderNovaSenha,

  atenderAtivacaoPerfil

} from "../controllers/usuario.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| ROTA PÚBLICA
|--------------------------------------------------------------------------
*/

router.post(

  "/solicitar-acesso",

  solicitarAcesso

);

/*
|--------------------------------------------------------------------------
| SOLICITAÇÕES DE ACESSO
|--------------------------------------------------------------------------
|
| Somente GERAL e ADMINISTRADOR podem visualizar
| as solicitações pendentes.
|
*/

router.get(

  "/solicitacoes-acesso",

  auth,

  autorizar(

    "GERAL",

    "ADMINISTRADOR"

  ),

  listarSolicitacoesAcesso

);

router.put(

  "/solicitacoes-acesso/:id/cancelar",

  auth,

  autorizar(

    "GERAL",

    "ADMINISTRADOR"

  ),

  cancelarSolicitacaoAcesso

);

router.put(

  "/solicitacoes-acesso/:id/atender-senha",

  auth,

  autorizar(

    "GERAL",

    "ADMINISTRADOR"

  ),

  atenderNovaSenha

);

router.put(

  "/solicitacoes-acesso/:id/atender-perfil",

  auth,

  autorizar(

    "GERAL",

    "ADMINISTRADOR"

  ),

  atenderAtivacaoPerfil

);

/*
|--------------------------------------------------------------------------
| ROTAS ADMINISTRATIVAS
|--------------------------------------------------------------------------
*/

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