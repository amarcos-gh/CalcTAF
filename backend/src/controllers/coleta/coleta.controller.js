import prisma from "../../config/prisma.js";

function calcularIdade(dataNascimento) {

  if (!dataNascimento) return null;

  const hoje = new Date();
  const nascimento = new Date(dataNascimento);

  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const fezAniversario =
    hoje.getMonth() > nascimento.getMonth() ||
    (
      hoje.getMonth() === nascimento.getMonth() &&
      hoje.getDate() >= nascimento.getDate()
    );

  if (!fezAniversario) {
    idade--;
  }

  return idade;
}

export async function buscarMilitares(req, res) {

  try {

    const {

      busca,

      omId,

      numeroTAF,

      numeroChamada

    } = req.query;

    const ano = new Date().getFullYear();

    const campanha = await prisma.campanhaTAF.findUnique({

      where: {

        ano_numeroTAF: {

          ano,

          numeroTAF: Number(numeroTAF)

        }

      }

    });

    let chamadaId = null;

    if (campanha) {

      const chamada = await prisma.chamadaTAF.findUnique({

        where: {

          campanhaId_numeroChamada: {

            campanhaId: campanha.id,

            numeroChamada: Number(numeroChamada)

          }

        }

      });

      if (chamada) {

        chamadaId = chamada.id;

      }

    }

    // =====================================================
    // TOTAL DE MILITARES DA OM
    // =====================================================

    const total = await prisma.militar.count({

      where: {

        omId: Number(omId),

        ativo: true

      }

    });

    // =====================================================
    // TOTAL DE AVALIADOS NESTA CHAMADA
    // =====================================================

    let avaliados = 0;

    if (chamadaId) {

      avaliados = await prisma.avaliacaoTAF.count({

        where: {

          chamadaId,

          militar: {

            omId: Number(omId)

          }

        }

      });

    }

    // =====================================================
    // FILTRO DE PESQUISA
    // Se não houver pesquisa, retorna todos os militares.
    // Se houver pesquisa (3+ letras), filtra pelo nome.
    // =====================================================

    const filtroPesquisa =
      busca && busca.length >= 3
        ? {
            nomeGuerra: {
              startsWith: busca.toUpperCase()
            }
          }
        : {};

    // =====================================================
    // PESQUISA DOS MILITARES
    // =====================================================

    const militares = await prisma.militar.findMany({

      where: {

        ativo: true,

        omId: Number(omId),

        ...filtroPesquisa

      },

      include: {

        postoGraduacao: true,

        curso: true,

        subunidade: true,

        avaliacoes: chamadaId

          ? {

              where: {

                chamadaId

              },

              select: {

                id: true

              }

            }

          : false

      },

      orderBy: [

        {

          postoGraduacao: {

            ordem: "asc"

          }

        },

        {

          nomeGuerra: "asc"

        }

      ]

    });

    const resultado = militares.map((militar) => ({

      ...militar,

      idade: calcularIdade(militar.dataNascimento),

      avaliado:

        chamadaId

          ? militar.avaliacoes.length > 0

          : false

    }));

    return res.json({

      militares: resultado,

      avaliados,

      total,

      chamadaId

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error: "Erro ao buscar militares."

    });

  }

}

export async function buscarChamada(req, res) {

  try {

    const {

      numeroTAF,

      numeroChamada

    } = req.query;

    const ano = new Date().getFullYear();

    const campanha = await prisma.campanhaTAF.findUnique({

      where: {

        ano_numeroTAF: {

          ano,

          numeroTAF: Number(numeroTAF)

        }

      }

    });

    if (!campanha) {

      return res.status(404).json({

        error: "Campanha não encontrada."

      });

    }

    const chamada = await prisma.chamadaTAF.findUnique({

      where: {

        campanhaId_numeroChamada: {

          campanhaId: campanha.id,

          numeroChamada: Number(numeroChamada)

        }

      }

    });

    if (!chamada) {

      return res.status(404).json({

        error: "Chamada não encontrada."

      });

    }

    return res.json({

      chamadaId: chamada.id

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error: "Erro ao localizar chamada."

    });

  }

}

// =====================================================
// EXPORTAR ARQUIVO DE COLETA
// =====================================================

export async function exportarColeta(req, res) {

  try {

    const {

      omId,

      numeroTAF,

      numeroChamada

    } = req.query;

    const ano = new Date().getFullYear();

    const campanha = await prisma.campanhaTAF.findUnique({

      where: {

        ano_numeroTAF: {

          ano,

          numeroTAF: Number(numeroTAF)

        }

      }

    });

    if (!campanha) {

      return res.status(404).json({

        error: "Campanha não encontrada."

      });

    }

    const chamada = await prisma.chamadaTAF.findUnique({

      where: {

        campanhaId_numeroChamada: {

          campanhaId: campanha.id,

          numeroChamada: Number(numeroChamada)

        }

      }

    });

    if (!chamada) {

      return res.status(404).json({

        error: "Chamada não encontrada."

      });

    }    
    
    // =====================================================
    // DAQUI EM DIANTE COMEÇA A NOVA LÓGICA DE EXPORTAÇÃO
    // =====================================================

    let militares = [];

    // =====================================================
    // 1ª CHAMADA
    // Exporta todos os militares ativos da OM
    // =====================================================

    if (Number(numeroChamada) === 1) {

      militares = await prisma.militar.findMany({

        where: {

          ativo: true,

          omId: Number(omId)

        },

        include: {

          postoGraduacao: true,

          curso: true,

          subunidade: true,

          om: true

        },

        orderBy: [

          {

            postoGraduacao: {

              ordem: "asc"

            }

          },

          {

            nomeGuerra: "asc"

          }

        ]

      });

    }

    // =====================================================
    // 2ª CHAMADA
    // Exporta:
    // - militares sem avaliação na 1ª Chamada;
    // - militares com pelo menos um exercício NR.
    // =====================================================

    else {

      const primeiraChamada = await prisma.chamadaTAF.findUnique({

        where: {

          campanhaId_numeroChamada: {

            campanhaId: campanha.id,

            numeroChamada: 1

          }

        }

      });

      if (!primeiraChamada) {

        return res.status(404).json({

          error: "1ª chamada não encontrada."

        });

      }

      const militaresOM = await prisma.militar.findMany({

        where: {

          ativo: true,

          omId: Number(omId)

        },

        include: {

          postoGraduacao: true,

          curso: true,

          subunidade: true,

          om: true,

          avaliacoes: {

            where: {

              chamadaId: primeiraChamada.id

            }

          }

        },

        orderBy: [

          {

            postoGraduacao: {

              ordem: "asc"

            }

          },

          {

            nomeGuerra: "asc"

          }

        ]

      });

      militares = militaresOM.filter((militar) => {

        // Não possui avaliação na 1ª Chamada
        if (militar.avaliacoes.length === 0) {

          return true;

        }

        const avaliacao = militar.avaliacoes[0];

        // Possui pelo menos um exercício NR
        return (

          avaliacao.mencaoCorrida === "NR" ||

          avaliacao.mencaoFlexao === "NR" ||

          avaliacao.mencaoAbdominal === "NR" ||

          avaliacao.mencaoBarra === "NR" ||

          avaliacao.mencaoPPM === "NR"

        );

      });

    }

    // =====================================================
    // CALCULA A IDADE E A ADICIONA A CADA MILITAR
    // =====================================================

    militares = militares.map((militar) => ({

      ...militar,

      idade: calcularIdade(militar.dataNascimento)

    }));

    // =====================================================
    // OBJETO DA COLETA
    // =====================================================

    const coleta = {

      tipo: "CALCTAF_COLETA",

      versao: 1,

      dataGeracao: new Date(),

      ano,

      campanha,

      chamada,

      militares

    };

    return res.json(coleta);

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error: "Erro ao exportar coleta."

    });

  }

}