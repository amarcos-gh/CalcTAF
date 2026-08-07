import prisma from "../../config/prisma.js";

import bcrypt from "bcryptjs";

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

function gerarCodigoAutenticacao() {

  return String(

    Math.floor(

      100000 + Math.random() * 900000

    )

  );

}

export async function buscarMilitares(req, res) {

  try {

    const {

      busca,

      omId,

      numeroTAF,

      numeroChamada,

      subunidadeId

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

    const filtroMilitar = {

      ativo: true,

      omId: Number(omId)

    };

    if (subunidadeId && Number(subunidadeId) > 0) {

      filtroMilitar.subunidadeId = Number(subunidadeId);

    }

    // =====================================================
    // TOTAL DE MILITARES DA OM
    // =====================================================

    const total = await prisma.militar.count({

      where: filtroMilitar

    });

    // =====================================================
    // TOTAL DE AVALIADOS NESTA CHAMADA
    // =====================================================

    let avaliados = 0;

    if (chamadaId) {

      avaliados = await prisma.avaliacaoTAF.count({

        where: {

          chamadaId,

          militar: filtroMilitar

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

        ...filtroMilitar,

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

    const campanhaBD = await prisma.campanhaTAF.findUnique({

      where: {

        ano_numeroTAF: {

          ano,

          numeroTAF: Number(numeroTAF)

        }

      }

    });

    if (!campanhaBD) {

      return res.status(404).json({

        error: "Campanha não encontrada."

      });

    }

    const campanha = {

      ...campanhaBD,

      periodoInicio:

        campanhaBD.periodoInicio

          ?.toISOString()

          .slice(0, 10),

      periodoFim:

        campanhaBD.periodoFim

          ?.toISOString()

          .slice(0, 10)

    };

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

      numeroChamada,

      subunidadeId,

      militares: militaresIds

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

    const filtroMilitar = {

      ativo: true,

      omId: Number(omId)

    };

    if (subunidadeId && Number(subunidadeId) > 0) {

      filtroMilitar.subunidadeId = Number(subunidadeId);

    }

    // =====================================================
    // MILITARES SELECIONADOS PELO ADMINISTRADOR
    // =====================================================

    const militaresSelecionados =

      militaresIds

        ? militaresIds

            .split(",")

            .map(id => Number(id))

            .filter(id => Number.isInteger(id) && id > 0)

        : [];

    if (militaresSelecionados.length > 0) {

      filtroMilitar.id = {

        in: militaresSelecionados

      };

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
    // DADOS DA COLETA
    // =====================================================

    const om = await prisma.oM.findUnique({

      where: {

        id: Number(omId)

      }

    });

    const subunidade =
      subunidadeId && Number(subunidadeId) > 0

        ? await prisma.subunidade.findUnique({

            where: {

              id: Number(subunidadeId)

            }

          })

        : null;

    const avaliador = await prisma.usuario.findFirst({

      where: {

        perfil: "AVALIADOR",

        omId: Number(omId),

        subunidade: subunidade?.nome

      },

      select: {

        id: true,

        nome: true,

        email: true,

        subunidade: true

      }

    });

    if (!avaliador) {

      return res.status(400).json({

        error:
          "Nenhum avaliador cadastrado para esta Subunidade."

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

        where: filtroMilitar,

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

        where: filtroMilitar,

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
    // CÓDIGO DE AUTENTICAÇÃO
    // =====================================================

    const codigoAutenticacao = gerarCodigoAutenticacao();

    const hashAutenticacao = await bcrypt.hash(

      codigoAutenticacao,

      10

    );

    // =====================================================
    // GRAVA O HASH, A DATA E O AVALIADOR NA CHAMADA
    // =====================================================

    await prisma.chamadaTAF.update({

      where: {

        id: chamada.id

      },

      data: {

        avaliadorId: avaliador.id,

        codigoAutenticacaoHash: hashAutenticacao,

        codigoGeradoEm: new Date()

      }

    });

    // =====================================================
    // RECARREGA A CHAMADA ATUALIZADA
    // =====================================================

    const chamadaAtualizada =
      await prisma.chamadaTAF.findUnique({

        where: {

          id: chamada.id

        }

      });

    // =====================================================
    // ORDERBY
    // =====================================================

    const indicesTAF =
      await prisma.indiceTAF.findMany({

        orderBy: [

          { segmento: "asc" },

          { cursoCodigo: "asc" },

          { exercicio: "asc" },

          { idadeMin: "asc" }

        ]

      });

    // =====================================================
    // DADOS DA COLETA
    // =====================================================

    const coleta = {

      tipo: "CALCTAF_COLETA",

      versao: 1,

      dataGeracao: new Date(),

      ano,

      campanha,

      chamada: chamadaAtualizada,

      om,

      subunidade,

      avaliador,

      hashAutenticacao,

      militares,

      indicesTAF

    };

    return res.json({

      coleta,

      codigoAutenticacao

    });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        error: "Erro ao exportar coleta."

      });

    }

}

// =====================================================
// IMPORTAÇÃO DOS RESULTADOS
// =====================================================

export async function importarResultados(req, res) {

  try {

    const resultados = req.body;

    // ==========================================
    // VALIDA TIPO
    // ==========================================

    if (

      resultados.tipo !== "RESULTADO_AVALIACAO"

    ) {

      return res.status(400).json({

        error: "Arquivo de resultados inválido."

      });

    }

    // ==========================================
    // VALIDA VERSÃO
    // ==========================================

    if (

      String(resultados.versao) !== "1.0"

    ) {

      return res.status(400).json({

        error: "Versão do arquivo incompatível."

      });

    }

    // ==========================================
    // VALIDA EXISTÊNCIA DAS AVALIAÇÕES
    // ==========================================

    if (

      !Array.isArray(resultados.avaliacoes) ||

      resultados.avaliacoes.length === 0

    ) {

      return res.status(400).json({

        error: "Arquivo sem avaliações."

      });

    }

    let importadas = 0;

    for (const avaliacao of resultados.avaliacoes) {

      const chamada = await prisma.chamadaTAF.findUnique({

        where: {

          campanhaId_numeroChamada: {

            campanhaId: resultados.campanha.id,

            numeroChamada: resultados.chamada.numeroChamada

          }

        }

      });

      if (!chamada) {

        continue;

      }

      await prisma.avaliacaoTAF.upsert({

        where: {

          militarId_chamadaId: {

            militarId: avaliacao.militarId,

            chamadaId: chamada.id

          }

        },

        create: {

          militarId: avaliacao.militarId,

          chamadaId: chamada.id,

          corrida: avaliacao.corrida,

          mencaoCorrida: avaliacao.mencaoCorrida,

          flexao: avaliacao.flexao,

          mencaoFlexao: avaliacao.mencaoFlexao,

          abdominal: avaliacao.abdominal,

          mencaoAbdominal: avaliacao.mencaoAbdominal,

          barra: avaliacao.barra,

          mencaoBarra: avaliacao.mencaoBarra,

          ppm: avaliacao.ppm,

          mencaoPPM: avaliacao.mencaoPPM,

          mencaoFinal: avaliacao.mencaoFinal,

          situacao: avaliacao.status

        },

        update: {

          corrida: avaliacao.corrida,

          mencaoCorrida: avaliacao.mencaoCorrida,

          flexao: avaliacao.flexao,

          mencaoFlexao: avaliacao.mencaoFlexao,

          abdominal: avaliacao.abdominal,

          mencaoAbdominal: avaliacao.mencaoAbdominal,

          barra: avaliacao.barra,

          mencaoBarra: avaliacao.mencaoBarra,

          ppm: avaliacao.ppm,

          mencaoPPM: avaliacao.mencaoPPM,

          mencaoFinal: avaliacao.mencaoFinal,

          situacao: avaliacao.status

        }

      });

      importadas++;

    }

    return res.json({

      message: "Importação concluída.",

      importadas

    });

  }

  catch (error) {

    console.error(error);

    return res.status(500).json({

      error: "Erro ao importar resultados."

    });

  }

}