import prisma from "../config/prisma.js";

export async function listarSubunidades(
  req,
  res
) {

  try {

    const {

      omId

    } = req.query;

    const where = {};

    if (

      omId

    ) {

      where.omId =

        Number(
          omId
        );
    }

    const subunidades =

      await prisma.subunidade.findMany({

        where,

        orderBy: {

          nome:
            "asc"
        }
      });

    return res.json(

      subunidades
    );

  } catch (

    error

  ) {

    console.error(

      error
    );

    return res.status(500).json({

      error:
        "Erro ao listar subunidades."
    });
  }
}