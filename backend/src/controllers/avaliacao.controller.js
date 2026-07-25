import prisma from "../config/prisma.js";

import { calcularIdade } from "../utils/calcularIdade.js";

//import { calcularMencaoCorrida } from "../services/calcularCorrida.js";
import calcularMencao from "../services/calcularMencao.js";

import calcularMencaoFinal from "../services/calcularMencaoFinal.js";

export async function criarAvaliacao(req, res) {
console.log(req.body);
  try {

    const {

      militarId,
      chamadaId,
      corrida,
      flexao,
      abdominal,
      periodoInicio,
      periodoFim

    } = req.body;

    let {

      barra,
      ppm

    } = req.body;

      const {

    omId

  } = req.body;

  const militar =

    await prisma.militar.findFirst({

      where: {

        id:

          Number(
            militarId
          ),

        omId:

          Number(
            omId
          )
      },

      include: {

        postoGraduacao: true,

        curso: true,

        om: true,

        subunidade: true
      }
    });

  if (

    !militar

  ) {

    return res.status(404).json({

      error:

        "Militar não encontrado na OM selecionada."
    });
  }

  if (

    !militar.curso

  ) {

    return res.status(400).json({

      error:

        "Militar sem curso cadastrado."
    });
  }

  if (

    !militar.omId

  ) {

    return res.status(400).json({

      error:

        "Militar sem OM cadastrada."
    });
  }

  const idade = calcularIdade(
    militar.dataNascimento
  );

  const mencaoCorrida =
  await calcularMencao({

  segmento:
    militar.segmento
      ?.trim()
      .toUpperCase(),

  cursoCodigo:
    militar.curso.codigo
      ?.trim()
      .toUpperCase(),

  exercicio:
    "CORRIDA",

  idade,

  valor:
    corrida

  });

  const mencaoFlexao =
  await calcularMencao({

  segmento:
    militar.segmento
      ?.trim()
      .toUpperCase(),

  cursoCodigo:
    militar.curso.codigo
      ?.trim()
      .toUpperCase(),

  exercicio:
    "FLEXAO",

  idade,

  valor:
    flexao

  });

  const mencaoAbdominal =
  await calcularMencao({

  segmento:
    militar.segmento
      ?.trim()
      .toUpperCase(),

  cursoCodigo:
    militar.curso.codigo
      ?.trim()
      .toUpperCase(),

  exercicio:
    "ABDOMINAL",

  idade,

  valor:
    abdominal

  });

  const cursoEspecial =

    ["LEMS", "LEMC", "LEMCT"]

      .includes(

        militar.curso.codigo
          ?.trim()
          .toUpperCase()
      );

  const dispensaBarra =

    cursoEspecial

    ||

    idade >= 50;

  const dispensaPPM =

    cursoEspecial

    ||

    idade >= 40;

  const militar50Mais =

    idade >= 50;

  let mencaoBarra;

    if (

    dispensaBarra

  ) {

    barra = null;

    mencaoBarra = "NF";

  } else {

  mencaoBarra =

    await calcularMencao({

      segmento:

        militar.segmento
          ?.trim()
          .toUpperCase(),

      cursoCodigo:

        militar.curso.codigo
          ?.trim()
          .toUpperCase(),

      exercicio:

        "BARRA",

      idade,

      valor:

        barra
    });
}

  let mencaoPPM;

  if (

    dispensaPPM

  ) {

    ppm = null;

    mencaoPPM = "NF";

  } else {

    mencaoPPM = ppm;
  }

  console.table({

    militar:

      militar.nomeGuerra,

    idade,

    curso:

      militar.curso?.codigo,

    segmento:

      militar.segmento
          ?.trim()
          .toUpperCase(),

    corrida:

      mencaoCorrida,

    flexao:

      mencaoFlexao,

    abdominal:

      mencaoAbdominal,

    barra:

      mencaoBarra
  });

  const mencaoFinal =
    calcularMencaoFinal({

      mencaoCorrida,

      mencaoFlexao,

      mencaoAbdominal,

      mencaoBarra
    });

  if (

    periodoInicio

    &&

    periodoFim

  ) {

    await prisma.chamadaTAF.update({

      where: {

        id:

          Number(
            chamadaId
          )
      },

      data: {

        periodoInicio:

          new Date(
            periodoInicio
          ),

        periodoFim:

          new Date(
            periodoFim
          )
      }
    });
  }

  const dadosAvaliacao = {

    militarId:
      Number(militarId),

    chamadaId:
      Number(chamadaId),

    corrida,
    mencaoCorrida,

    flexao,
    mencaoFlexao,

    abdominal,
    mencaoAbdominal,

    barra,
    mencaoBarra,

    ppm,
    mencaoPPM,

    mencaoFinal
  };

  const avaliacaoMesmoTAF =

    await prisma.avaliacaoTAF.findFirst({

    where: {

      militarId:

        Number(
          militarId
        ),

      chamada: {

        campanhaId:

          (
            await prisma.chamadaTAF.findUnique({

              where: {

                id:

                  Number(
                    chamadaId
                  )
              }

            })

          ).campanhaId
      }
    },

    include: {

      chamada: true
    }

    });

    if (

    avaliacaoMesmoTAF

    &&

    avaliacaoMesmoTAF.chamadaId !==

    Number(
      chamadaId
    )

    ) {

    return res.status(400).json({

    error:

      `Militar já está relacionado na ${avaliacaoMesmoTAF.chamada.numeroChamada}ª Chamada deste TAF.`

    });
  }

  const avaliacaoExistente =

    await prisma.avaliacaoTAF.findFirst({

      where: {

        militarId:
          Number(militarId),

        chamadaId:
          Number(chamadaId)
      }
    });

  let avaliacao;

  if (avaliacaoExistente) {

    avaliacao =

      await prisma.avaliacaoTAF.update({

        where: {

          id:
            avaliacaoExistente.id
        },

        data:
          dadosAvaliacao,

        include: {

          militar: {

            include: {

            postoGraduacao: true,

            curso: true,

            subunidade: true,

            om: true
            }
          },

          chamada: {

            include: {

              campanha: true
            }
          }
        }
      });

  } else {

  avaliacao =

    await prisma.avaliacaoTAF.create({

      data:
        dadosAvaliacao,

      include: {

        militar: {

          include: {

            postoGraduacao: true,

            curso: true,

            subunidade: true,

            om: true
          }
        },

        chamada: {

          include: {

            campanha: true
          }
        }
      }
    });
}

  return res.status(201).json(avaliacao);

  } catch (error) {

    console.error(error);

      return res.status(500).json({

        error:
          error.message
      });
    }
  }

  export async function atualizarAvaliacao(
  req,
  res
  ) {

  try {

    const { id } = req.params;

    const {

      corrida,
      flexao,

      abdominal,
      barra,

      ppm,

      periodoInicio,
      periodoFim

    } = req.body;

    const avaliacaoAtual =
      await prisma.avaliacaoTAF.findUnique({

        where: {
          id: Number(id)
        },

        include: {

          militar: {
            include: {
              curso: true
            }
          }
        }
      });

    if (!avaliacaoAtual) {

      return res.status(404).json({

        error:
          "Avaliação não encontrada."
      });
    }

    const militar =
      avaliacaoAtual.militar;

    const idade = calcularIdade(
      militar.dataNascimento
    );

    const corridaFinal =
      corrida !== undefined
        ? corrida
        : avaliacaoAtual.corrida;

    const flexaoFinal =
      flexao !== undefined
        ? flexao
        : avaliacaoAtual.flexao;

    const abdominalFinal =
      abdominal !== undefined
        ? abdominal
        : avaliacaoAtual.abdominal;

    let barraFinal =
      barra !== undefined
        ? barra
        : avaliacaoAtual.barra;

    let ppmFinal =
      ppm !== undefined
        ? ppm
        : avaliacaoAtual.ppm;

    const mencaoCorrida =
      await calcularMencao({

        segmento: militar.segmento
          ?.trim()
          .toUpperCase(),

        cursoCodigo:
          militar.curso.codigo
            ?.trim()
            .toUpperCase(),

        exercicio: "CORRIDA",

        idade,

        valor: corrida
      });

    const mencaoFlexao =
      await calcularMencao({

        segmento: militar.segmento
          ?.trim()
          .toUpperCase(),

        cursoCodigo:
          militar.curso.codigo
            ?.trim()
            .toUpperCase(),

        exercicio: "FLEXAO",

        idade,

        valor: flexao
      });

    const mencaoAbdominal =
      await calcularMencao({

        segmento: militar.segmento
          ?.trim()
          .toUpperCase(),

        cursoCodigo:
          militar.curso.codigo
            ?.trim()
            .toUpperCase(),

        exercicio: "ABDOMINAL",

        idade,

        valor: abdominal
      });

    const cursoEspecial =

      ["LEMS", "LEMC", "LEMCT"]

        .includes(

          militar.curso.codigo
            ?.trim()
            .toUpperCase()
        );

    const dispensaBarra =

      cursoEspecial

      ||

      idade >= 50;

    const dispensaPPM =

      cursoEspecial

      ||

      idade >= 40;

    const militar50Mais =

      idade >= 50;

    let mencaoBarra;

    if (

      dispensaBarra

    ) {

      barraFinal = null;

      mencaoBarra = "NF";

    } else {

      mencaoBarra =

        await calcularMencao({

          segmento:

            militar.segmento
              ?.trim()
              .toUpperCase(),

          cursoCodigo:

            militar.curso.codigo
              ?.trim()
              .toUpperCase(),

          exercicio:

            "BARRA",

          idade,

          valor:

            barraFinal
        });
    }

    let mencaoPPM;

    if (

      dispensaPPM

    ) {

      ppmFinal = null;

      mencaoPPM = "NF";

    } else {

      mencaoPPM = ppmFinal;
    }

    console.table({

  militar:

    militar.nomeGuerra,

  curso:

    militar.curso?.codigo,

  segmento:

    militar.segmento
        ?.trim()
        .toUpperCase(),

  idade,

  corrida:

    {
      valor:
        corridaFinal,

      mencao:
        mencaoCorrida
    },

  flexao:

    {
      valor:
        flexaoFinal,

      mencao:
        mencaoFlexao
    },

  abdominal:

    {
      valor:
        abdominalFinal,

      mencao:
        mencaoAbdominal
    },

  barra:

    {
      valor:
        barraFinal,

      mencao:
        mencaoBarra
    }
});

    const mencaoFinal =
      calcularMencaoFinal({

        mencaoCorrida,

        mencaoFlexao,

        mencaoAbdominal,

        mencaoBarra
      });

    if (

      periodoInicio

      &&

      periodoFim

    ) {

      await prisma.chamadaTAF.update({

        where: {

          id:

            avaliacaoAtual.chamadaId
        },

        data: {

          periodoInicio:

            new Date(
              periodoInicio
            ),

          periodoFim:

            new Date(
              periodoFim
            )
        }
      });
    }

    const avaliacao =
      await prisma.avaliacaoTAF.update({

        where: {
          id: Number(id)
        },

        data: {

          corrida:
            corridaFinal,

          mencaoCorrida,

          flexao:
            flexaoFinal,

          mencaoFlexao,

          abdominal:
            abdominalFinal,

          mencaoAbdominal,

          barra:
            barraFinal,

          mencaoBarra,

          ppm:
            ppmFinal,

          mencaoPPM,

          mencaoFinal
        },

        include: {

          militar: {

            include: {

              curso: true
            }
          },

          chamada: {

            include: {

              campanha: true
            }
          }
        }
      });

    res.json(avaliacao);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      error:
        "Erro ao atualizar avaliação."
    });
  }
  }

  export async function listarAvaliacoes(
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

      where.militar = {

        omId:

          Number(
            omId
          )
      };
    }

    const avaliacoes =

      await prisma.avaliacaoTAF.findMany({

        where,

        include: {

          militar: {

            include: {

              postoGraduacao: true,

              curso: true,

              subunidade: true,

              om: true
            }
          },

          chamada: {

            include: {

              campanha: true
            }
          }
        },

        orderBy: [

          {

            militar: {

              postoGraduacao: {

                ordem:

                  "asc"
              }
            }
          },

          {

            militar: {

              nomeGuerra:

                "asc"
            }
          }
        ]
      });

    return res.json(

      avaliacoes
    );

  } catch (

    error

  ) {

    console.error(

      error
    );

    return res.status(500).json({

      error:

        "Erro ao listar avaliações."
    });
  }
}

export async function limparAvaliacoesDuplicadas(
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

    const avaliacoes =

      await prisma.avaliacaoTAF.findMany({

        where: {

          militar: {

            omId:

              Number(
                omId
              )
          }
        },

        include: {

          militar: {

            include: {

              postoGraduacao: true
            }
          },

          chamada: true
        },

        orderBy: {

          militarId:
            "asc"
        }
      });

    const grupos = {};

    for (

      const a

      of

      avaliacoes

    ) {

      const chave =

        `${a.militarId}-${a.chamadaId}`;

      if (

        !grupos[chave]

      ) {

        grupos[chave] = [];
      }

      grupos[chave].push({

        id:
          a.id,

        militar:
          a.militar.nomeGuerra,

        chamada:
          a.chamadaId,

        mencao:
          a.mencaoFinal
      });
    }

    const duplicadas =

      Object.entries(

        grupos

      )

      .filter(

        ([_, lista]) =>

          lista.length > 1
      );

    return res.json({

      duplicadas
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        error.message
    });
  }
}