import { Router } from "express";

import prisma from "../config/prisma.js";

const router = Router();

router.get("/", async (req, res) => {

  try {

    const {

      omId

    } = req.query;

    if (

      !omId

    ) {

      return res.status(400).json({

        error:
          "OM não informada."
      });
    }

    const subunidades =
      await prisma.subunidade.findMany({

        where: {

          omId:

            Number(
              omId
            )
        },

        orderBy: {

          nome:
            "asc"
        }
      });

    return res.json(

      subunidades
    );

  } catch (error) {

    console.error(

      error
    );

    return res.status(500).json({

      error:
        "Erro ao buscar subunidades."
    });
  }
});

export default router;