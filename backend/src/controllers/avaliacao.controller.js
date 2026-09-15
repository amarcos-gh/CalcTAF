import prisma from "../config/prisma.js";
import calcularIdade from "../utils/calcularIdade.js";
import calcularMencao from "../services/calcularMencao.js";
import calcularMencaoFinal from "../services/calcularMencaoFinal.js";

function calcularSuficiencia(mencaoFinal) {

  if (mencaoFinal === "NR") {
    return "";
  }

  if (
    mencaoFinal === "E" ||
    mencaoFinal === "MB" ||
    mencaoFinal === "B" ||
    mencaoFinal === "S"
  ) {
    return "S";
  }

  if (
    mencaoFinal === "R" ||
    mencaoFinal === "I"
  ) {
    return "NS";
  }

  return "";
}

function calcularSuficiencia50Mais({
  mencaoCorrida,
  mencaoFlexao,
  mencaoAbdominal
}) {

  const mencoes = [
    mencaoCorrida,
    mencaoFlexao,
    mencaoAbdominal
  ];

  const avaliado =
    mencoes.some(
      (mencao) =>
        mencao !== null &&
        mencao !== undefined &&
        mencao !== "" &&
        mencao !== "NR"
    );

  if (!avaliado) {
    return "";
  }

  if (mencoes.includes("I")) {
    return "NS";
  }

  if (
    mencoes.every(
      (mencao) =>
        mencao === "S"
    )
  ) {
    return "S";
  }

  return "";
}

export async function criarAvaliacao(req, res) {

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


// =====================================================
// MILITAR
// =====================================================

    const militar =

      await prisma.militar.findFirst({

        where: {

          id:
            Number(militarId),

          omId:
            Number(omId)

        },

        include: {

          postoGraduacao: true,

          curso: true,

          om: true,

          subunidade: true

        }

      });


    if (!militar) {

      return res.status(404).json({

        error:
          "Militar não encontrado na OM selecionada."

      });

    }


    if (!militar.curso) {

      return res.status(400).json({

        error:
          "Militar sem curso cadastrado."

      });

    }


    if (!militar.omId) {

      return res.status(400).json({

        error:
          "Militar sem OM cadastrada."

      });

    }


// =====================================================
// IDADE
// =====================================================

    const idade =

      calcularIdade(

        militar.dataNascimento

      );


    const militar50Mais =

      idade >= 50;


// =====================================================
// MENÇÃO - CORRIDA
// =====================================================

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


// =====================================================
// MENÇÃO - FLEXÃO
// =====================================================

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


// =====================================================
// MENÇÃO - ABDOMINAL
// =====================================================

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


// =====================================================
// CURSOS ESPECIAIS
// =====================================================

    const cursoEspecial =

      [

        "LEMS",
        "LEMC",
        "LEMCT"

      ].includes(

        militar.curso.codigo
          ?.trim()
          .toUpperCase()

      );


// =====================================================
// DISPENSAS
// =====================================================

    const dispensaBarra =

      cursoEspecial

      ||

      idade >= 50;


    const dispensaPPM =

      cursoEspecial

      ||

      idade >= 40;


// =====================================================
// MENÇÃO - BARRA
// =====================================================

    let mencaoBarra;


    if (dispensaBarra) {

      barra = null;

      mencaoBarra = "NF";

    }

    else if (

      idade >= 40

      &&

      idade <= 49

    ) {

      if (

        barra === ""

        ||

        barra === null

        ||

        barra === undefined

      ) {

        mencaoBarra = "NR";

      }

      else {

        const suficienciaBarra =

          idade <= 45

            ? 2

            : 1;


        mencaoBarra =

          Number(barra) >= suficienciaBarra

            ? "S"

            : "I";

      }

    }

    else {

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


// =====================================================
// MENÇÃO - PPM
// =====================================================

    let mencaoPPM;


    if (dispensaPPM) {

      ppm = null;

      mencaoPPM = "NF";

    }

    else {

      mencaoPPM = ppm;

    }

// =====================================================
// BARRA PARTICIPA DA MENÇÃO FINAL SOMENTE SE:
// - NÃO for curso especial
// - idade menor que 40
// =====================================================

    const considerarBarra =

      !cursoEspecial

      &&

      idade < 40;


// =====================================================
// MENÇÃO FINAL CALCULADA
//
// Esta variável é calculada sempre.
//
// Para 50+ ela será utilizada somente para definir
// a SUFICIÊNCIA.
// =====================================================

    const mencaoFinalCalculada =

      calcularMencaoFinal({

        mencaoCorrida,

        mencaoFlexao,

        mencaoAbdominal,

        mencaoBarra:

          considerarBarra

            ? mencaoBarra

            : null

      });

  let suficiencia;

  let mencaoFinal;

    if (militar50Mais) {

      suficiencia =
        calcularSuficiencia50Mais({
          mencaoCorrida,
          mencaoFlexao,
          mencaoAbdominal
        });

      const avaliado50Mais =
        mencaoCorrida !== "NR" ||
        mencaoFlexao !== "NR" ||
        mencaoAbdominal !== "NR";

      mencaoFinal =
        avaliado50Mais
          ? ""
          : "NR";

    } else {

      suficiencia =
        calcularSuficiencia(
          mencaoFinalCalculada
        );

      mencaoFinal =
        mencaoFinalCalculada;
    }

    if (militar.tafAlternativo === true) {

      if (suficiencia === "S") {

        suficiencia = "S/TA";

      } else if (suficiencia === "NS") {

        suficiencia = "NS/TA";

      }

    }

// =====================================================
// LOG DE CÁLCULO
// =====================================================

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
        mencaoBarra,

      mencaoFinalCalculada,

      mencaoFinal,

      suficiencia

    });

// =====================================================
// PERÍODO DA CHAMADA
// =====================================================

    if (

      periodoInicio

      &&

      periodoFim

    ) {

      await prisma.chamadaTAF.update({

        where: {

          id:
            Number(chamadaId)

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

// =====================================================
// DADOS DA AVALIAÇÃO
// =====================================================

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

      mencaoFinal,

      suficiencia

    };

// =====================================================
// CHAMADA
// =====================================================

    const chamada =

      await prisma.chamadaTAF.findUnique({

        where: {

          id:
            Number(chamadaId)

        }

      });


    if (!chamada) {

      return res.status(400).json({

        error:
          "Chamada TAF inválida."

      });

    }

// =====================================================
// VERIFICA SE JÁ EXISTE AVALIAÇÃO EM CHAMADA
// ANTERIOR DO MESMO TAF
// =====================================================

    const avaliacaoMesmoTAF =

      await prisma.avaliacaoTAF.findFirst({

        where: {

          militarId:
            Number(militarId),

          chamada: {

            campanhaId:
              chamada.campanhaId,

            numeroChamada: {

              lt:
                chamada.numeroChamada

            }

          },

          mencaoFinal: {

            not:
              "NR"

          }

        },

        include: {

          chamada: true

        }

      });


    if (avaliacaoMesmoTAF) {

      return res.status(400).json({

        error:

          `Militar já está relacionado na ${avaliacaoMesmoTAF.chamada.numeroChamada}ª Chamada deste TAF.`

      });

    }

// =====================================================
// PROCURA AVALIAÇÃO EXISTENTE
// =====================================================

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

// =====================================================
// ATUALIZAÇÃO
// =====================================================

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

      await prisma.logAvaliacao.create({

        data: {

          avaliacaoId:
            avaliacao.id,

          usuarioId:
            req.usuario.usuarioId,

          acao:
            "ATUALIZACAO",

          origem:
            "WEB"

        }

      });

    }

// =====================================================
// NOVO CADASTRO
// =====================================================

    else {

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

// =====================================================
// RETORNO
// =====================================================

    return res.status(201).json(

      avaliacao

    );


  }

    catch (error) {

      console.error(error);

      return res.status(500).json({

        error:
          error.message

      });

    }

  }

  export async function excluirAvaliacao(req, res) {

    try {

      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {

        return res.status(400).json({

          error: "ID da avaliação inválido."

        });

      }

      /*
      * Tudo acontece dentro de uma única transação.
      */
      const resultado = await prisma.$transaction(async (tx) => {

        /*
        * 1. Localiza a avaliação antes de excluí-la.
        */
        const avaliacao =
          await tx.avaliacaoTAF.findUnique({

            where: {
              id
            },

            include: {

              militar: true,

              chamada: true

            }

          });

        if (!avaliacao) {

          return null;

        }

        /*
        * 2. Cria o registro permanente da exclusão.
        *
        * IMPORTANTE:
        * Este log NÃO depende da AvaliacaoTAF existir depois.
        */
        await tx.logExclusaoAvaliacao.create({

          data: {

            avaliacaoId: avaliacao.id,

            militarId: avaliacao.militarId,

            chamadaId: avaliacao.chamadaId,

            origem: "WEB",

            acao: "EXCLUSAO"

          }

        });

        /*
        * 3. Remove os logs normais vinculados
        *    à avaliação.
        */
        await tx.logAvaliacao.deleteMany({

          where: {

            avaliacaoId: avaliacao.id

          }

        });

        /*
        * 4. Finalmente remove a avaliação.
        */
        await tx.avaliacaoTAF.delete({

          where: {

            id: avaliacao.id

          }

        });

        return avaliacao;

      });

      /*
      * Avaliação não encontrada.
      */
      if (!resultado) {

        return res.status(404).json({

          error:
            "Avaliação não encontrada."

        });

      }

      return res.status(200).json({

        message:
          "Avaliação excluída com sucesso.",

        avaliacaoId:
          resultado.id

      });

    } catch (error) {

      console.error(
        "ERRO AO EXCLUIR AVALIAÇÃO:",
        error
      );

      return res.status(500).json({

        error:
          "Erro ao excluir avaliação."

      });

    }

  }

  export async function atualizarAvaliacao(req, res) {

  try {
    console.log("USUÁRIO:", req.usuario);

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

        valor: corridaFinal
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

        valor: flexaoFinal
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

        valor: abdominalFinal
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

const considerarBarra =
  !cursoEspecial

  &&

  idade < 40;

const mencaoFinalCalculada =
  calcularMencaoFinal({

    mencaoCorrida,

    mencaoFlexao,

    mencaoAbdominal,

    mencaoBarra:

      considerarBarra

        ? mencaoBarra

        : null

  });

  let suficiencia;

  let mencaoFinal;

    if (militar50Mais) {

      suficiencia =
        calcularSuficiencia50Mais({
          mencaoCorrida,
          mencaoFlexao,
          mencaoAbdominal
        });

      const avaliado50Mais =
        mencaoCorrida !== "NR" ||
        mencaoFlexao !== "NR" ||
        mencaoAbdominal !== "NR";

      mencaoFinal =
        avaliado50Mais
          ? ""
          : "NR";

    } else {

      suficiencia =
        calcularSuficiencia(
          mencaoFinalCalculada
        );

      mencaoFinal =
        mencaoFinalCalculada;
    }

    if (militar.tafAlternativo === true) {

      if (suficiencia === "S") {

        suficiencia = "S/TA";

      } else if (suficiencia === "NS") {

        suficiencia = "NS/TA";

      }

    }

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

        mencaoFinal,

        suficiencia
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

    await prisma.logAvaliacao.create({

  data: {

    avaliacaoId: avaliacao.id,

    usuarioId: req.usuario.usuarioId,

    acao: "ATUALIZACAO",

    origem: "WEB"

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

  export async function listarAvaliacoes(req, res) {

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

export async function listarLogsAvaliacao(req, res) {

  try {

    const { omId } = req.query;

    const where = {};

    if (omId) {

      where.avaliacao = {

        militar: {

          omId: Number(omId)

        }

      };

    }

    const logs = await prisma.logAvaliacao.findMany({

      where,

      include: {

        usuario: {

          select: {

            id: true,

            nome: true

          }

        },

        avaliacao: {

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

        }

      },

      orderBy: {

        createdAt: "desc"

      }

    });

    return res.json(logs);

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error: "Erro ao listar histórico."

    });

  }

}

export async function limparAvaliacoesDuplicadas(req, res) {

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

export async function calcularAvaliacao(req, res) {

  try {

    const {

      militarId,
      omId,
      corrida,
      flexao,
      abdominal,
      barra,
      ppm

    } = req.body;

    const militar = await prisma.militar.findFirst({

      where: {

        id: Number(militarId),

        omId: Number(omId)

      },

      include: {

        curso: true

      }

    });

    if (!militar) {

      return res.status(404).json({

        error: "Militar não encontrado."

      });

    }

    const idade = calcularIdade(
      militar.dataNascimento
    );

    const militar50Mais = idade >= 50;

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

        exercicio: "CORRIDA",

        idade,

        valor: corrida

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

        exercicio: "FLEXAO",

        idade,

        valor: flexao

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

      cursoEspecial ||

      idade >= 50;

    const dispensaPPM =

      cursoEspecial ||

      idade >= 40;

    let mencaoBarra;

      if (cursoEspecial || idade >= 50) {

        mencaoBarra = "NF";

      }

      else if (idade >= 40) {

        if (barra == null || barra === "") {

          mencaoBarra = "NR";

        } else {

          const suficiencia = idade <= 45 ? 2 : 1;

          mencaoBarra =

            Number(barra) >= suficiencia

              ? "S"

              : "I";

        }

      }

      else {

        mencaoBarra = await calcularMencao({

          segmento:
            militar.segmento
              ?.trim()
              .toUpperCase(),

          cursoCodigo:
            militar.curso.codigo
              ?.trim()
              .toUpperCase(),

          exercicio: "BARRA",

          idade,

          valor: barra

        });

      }

    let mencaoPPM;

    if (

      dispensaPPM

    ) {

      mencaoPPM = "NF";

    }

    else {

      mencaoPPM = ppm;

    }

    const considerarBarra =
      !cursoEspecial

      &&

      idade < 40;

    const mencaoFinalCalculada =
      calcularMencaoFinal({

        mencaoCorrida,

        mencaoFlexao,

        mencaoAbdominal,

        mencaoBarra:

          considerarBarra

            ? mencaoBarra

            : null

      });

  let suficiencia;

  let mencaoFinal;

    if (militar50Mais) {

      suficiencia =
        calcularSuficiencia50Mais({
          mencaoCorrida,
          mencaoFlexao,
          mencaoAbdominal
        });

      const avaliado50Mais =
        mencaoCorrida !== "NR" ||
        mencaoFlexao !== "NR" ||
        mencaoAbdominal !== "NR";

      mencaoFinal =
        avaliado50Mais
          ? ""
          : "NR";

    } else {

      suficiencia =
        calcularSuficiencia(
          mencaoFinalCalculada
        );

      mencaoFinal =
        mencaoFinalCalculada;
    }

    if (militar.tafAlternativo === true) {

      if (suficiencia === "S") {

        suficiencia = "S/TA";

      } else if (suficiencia === "NS") {

        suficiencia = "NS/TA";

      }

    }

    return res.json({

      idade,

      dispensaBarra,

      dispensaPPM,

      mencaoCorrida,

      mencaoFlexao,

      mencaoAbdominal,

      mencaoBarra,

      mencaoPPM,

      mencaoFinal,

      suficiencia

    });

  } catch (erro) {

    console.error(erro);

    return res.status(500).json({

      error: erro.message

    });

  }

}