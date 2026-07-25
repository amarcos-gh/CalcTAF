import { Router } from "express";

import { criarMilitar, excluirMilitar, atualizarMilitar, listarMilitares } from "../controllers/militar.controller.js";

const router = Router();

router.post("/", criarMilitar);

router.delete("/:id", excluirMilitar);

router.put("/:id", atualizarMilitar);

router.get("/", listarMilitares);

export default router;