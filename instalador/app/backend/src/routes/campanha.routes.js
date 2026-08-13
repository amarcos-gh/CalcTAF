import { Router } from "express";

import prisma from "../config/prisma.js";

const router = Router();

router.get("/", async (req, res) => {

  try {

    const campanhas =
      await prisma.campanhaTAF.findMany({

        include: {
          chamadas: true
        },

        orderBy: {
          ano: "desc"
        }
      });

    return res.json(campanhas);

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error: error.message
    });
  }
});

export default router;