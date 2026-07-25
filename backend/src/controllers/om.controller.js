import prisma from "../config/prisma.js";

export async function listarOMs(req, res) {

  try {

    const oms =

      await prisma.oM.findMany({

        orderBy: {

          codom: "asc"
        }
      });

    return res.json(oms);

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        "Erro ao listar OMs."
    });
  }
}

export async function selecionarOM(req, res) {

  try {

    const {

      codom,

      sigla

    } = req.body;

    const om =

      await prisma.oM.upsert({

        where: {

          codom
        },

        update: {

          sigla
        },

        create: {

          codom,

          sigla
        }
      });

    return res.json(om);

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        "Erro ao salvar OM."
    });
  }
}