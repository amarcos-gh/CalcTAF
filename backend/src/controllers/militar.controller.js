import prisma from "../config/prisma.js";

function converterDataBR(data) {

  if (!data) {

    return null;
  }

  const [

    dia,
    mes,
    ano

  ] = data.split("/");

  return new Date(

    Number(ano),

    Number(mes) - 1,

    Number(dia)
  );
}

export async function criarMilitar(req, res) {

  console.log(

    "PRISMA MODELS:",

    Object.keys(prisma)

      .filter(

        key =>

          !key.startsWith("_")
      )
  );

  try {

    const {

      nomeCompleto,
      nomeGuerra,
      segmento,
      dataNascimento,
      omId,
      subunidade,
      postoGraduacaoId,
      cursoId

    } = req.body;

    const camposObrigatorios = {

      "Nome Completo":
        nomeCompleto,
      
      "Posto/Graduação":
        postoGraduacaoId,

      "Nome de Guerra":
        nomeGuerra,

      "Segmento":
        segmento,

      "Curso":
        cursoId,

      "Data de Nascimento":
        dataNascimento,

      "OM":
        omId,

      "Subunidade":
        subunidade
    };

    const faltando =

      Object.entries(

        camposObrigatorios

      )

      .filter(

        ([_, valor]) =>

          valor === null

          ||

          valor === undefined

          ||

          (

            typeof valor === "string"

            &&

            !valor.trim()
          )
      )

      .map(

        ([campo]) =>

          campo
      );

    if (

      faltando.length

    ) {

      return res.status(400).json({

        error:

          `Campos obrigatórios não preenchidos: ${faltando.join(", ")}`
      });
    }

const omExiste =

  await prisma.oM.findFirst({

    where: {

      id:
        Number(omId)
    }
  });

if (!omExiste) {

  return res.status(400).json({

    error:
      "OM inválida."
  });
}

    let subunidadeExistente =

    await prisma.subunidade.findFirst({

      where: {

        nome:

          subunidade.trim(),

        omId:

          Number(
            omId
          )
      }
    });

if (!subunidadeExistente) {

  subunidadeExistente =

    await prisma.subunidade.create({

      data: {

        nome:

          subunidade.trim(),

        omId:

          Number(omId)
      }
    });
}

const militar =

  await prisma.militar.create({

    data: {

      nomeCompleto:

        nomeCompleto.trim(),

      nomeGuerra:

        nomeGuerra.trim(),

      segmento,

      dataNascimento:

        converterDataBR(
          dataNascimento
        ),

      om: {

        connect: {

          id:

            Number(
              omId
            )
        }
      },

      subunidade: {

        connect: {

          id:

            subunidadeExistente.id
        }
      },

      postoGraduacao: {

        connect: {

          id:

            Number(
              postoGraduacaoId
            )
        }
      },

      curso: {

        connect: {

          id:

            Number(
              cursoId
            )
        }
      }
    },

    include: {

      postoGraduacao: true,

      om: true,

      subunidade: true,

      curso: true
    }
  });

return res.status(201).json(

  militar
);

  } catch (error) {

    return res.status(500).json({

      error:

        error.message
    });
  }
}

export async function atualizarMilitar(
  req,
  res
) {

  try {

    const { id } = req.params;

   const {

    nomeCompleto,
    postoGraduacaoId,
    nomeGuerra,
    segmento,
    cursoId,
    dataNascimento,
    subunidade,
    omId

  } = req.body;
  
const militarAtual =

  await prisma.militar.findUnique({

    where: {

      id:

        Number(
          id
        )
    },

    include: {

      postoGraduacao: true,

      curso: true,

      subunidade: true,

      om: true
    }
  });

if (!militarAtual) {

  return res.status(404).json({

    error:
      "Militar não encontrado."
  });
}

let subunidadeIdFinal =

  militarAtual.subunidadeId;

if (subunidade) {

  let subunidadeExistente =

    await prisma.subunidade.findFirst({

      where: {

        nome:

          subunidade.trim()
      }
    });

  if (

    !subunidadeExistente

  ) {

    subunidadeExistente =

      await prisma.subunidade.create({

        data: {

          nome:

            subunidade.trim(),

          omId:

            Number(
              omId
            )
        }
      });
  }

  subunidadeIdFinal =

    subunidadeExistente.id;
}

const militar =
  await prisma.militar.update({

    where: {

      id:

        militarAtual.id
    },

    data: {

      nomeCompleto:

        nomeCompleto ||

        militarAtual.nomeCompleto,

      postoGraduacaoId:

        postoGraduacaoId

          ?

          Number(
            postoGraduacaoId
          )

          :

          militarAtual.postoGraduacaoId,

      nomeGuerra:

        nomeGuerra ||

        militarAtual.nomeGuerra,

      segmento:

        segmento ||

        militarAtual.segmento,

      dataNascimento:

        dataNascimento

          ?

          converterDataBR(
            dataNascimento
          )

          :

          militarAtual.dataNascimento,

      cursoId:

        cursoId

          ?

          Number(
            cursoId
          )

          :

          militarAtual.cursoId,

      subunidadeId:

        subunidadeIdFinal
    },

    include: {

      postoGraduacao: true,

      curso: true,

      subunidade: true
    }
  });

res.json(

  militar
);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      error:
        "Erro ao atualizar militar."
    });
  }
}

export async function listarMilitares(
  req,
  res
) {

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

    const militares =
      await prisma.militar.findMany({

        where: {

          omId:
            Number(
              omId
            )
        },

        include: {

          postoGraduacao: true,

          curso: true,

          subunidade: true
        },

        orderBy: {

          nomeCompleto:
            "asc"
        }
      });

    return res.json(
      militares
    );

  } catch (error) {

    console.error(
      error
    );

    return res.status(500).json({

      error:
        "Erro ao listar militares."
    });
  }
}

export async function excluirMilitar(
  req,
  res
) {

  try {

    const { id } = req.params;

    await prisma.avaliacaoTAF.deleteMany({

      where: {

        militarId: Number(id)

      }

    });

    await prisma.militar.delete({

      where: {

        id: Number(id)

      }

    });

    return res.json({

      message:
        "Militar excluído com sucesso."

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        error.message

    });

  }

}