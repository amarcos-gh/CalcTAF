import prisma from "../config/prisma.js";

export async function importarAvaliacoesCampo(req, res) {

  try {

    const dados = req.body;

    if (!dados) {

      return res.status(400).json({

        error: "Arquivo não informado."

      });

    }

    if (dados.tipo !== "AVALIACOES") {

      return res.status(400).json({

        error: "Arquivo inválido."

      });

    }

    if (!Array.isArray(dados.avaliacoes)) {

      return res.status(400).json({

        error: "Arquivo sem avaliações."

      });

    }

    if (dados.avaliacoes.length === 0) {

      return res.status(400).json({

        error: "Nenhuma avaliação encontrada."

      });

    }

    const campanha = await prisma.campanhaTAF.findFirst({

      where: {

        numeroTAF:

          Number(

            dados.campanha.numeroTAF

          )

      }

    });

    if (!campanha) {

      return res.status(404).json({

        error:

          "Campanha não encontrada."

      });

    }

    const chamada = await prisma.chamadaTAF.findFirst({

      where: {

        campanhaId:

          campanha.id,

        numeroChamada:

          Number(

            dados.campanha.numeroChamada

          )

      }

    });

    if (!chamada) {

      return res.status(404).json({

        error:

          "Chamada não encontrada."

      });

    }

    let importadas = 0;

    let atualizadas = 0;

    let ignoradas = 0;

    const erros = [];

    for (const avaliacao of dados.avaliacoes) {

      try {

        const militar = await prisma.militar.findFirst({

          where: {

            id: Number(avaliacao.militarId)

          }

        });

        if (!militar) {

          ignoradas++;

          erros.push({

            militarId: avaliacao.militarId,

            motivo: "Militar não encontrado."

          });

          continue;

        }

        const avaliacaoExistente =

          await prisma.avaliacaoTAF.findFirst({

            where: {

              militarId: militar.id,

              chamadaId: chamada.id

            }

          });

        const dadosAvaliacao = {

          militarId: militar.id,

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

          mencaoFinal: avaliacao.mencaoFinal

        };

        if (avaliacaoExistente) {

          await prisma.avaliacaoTAF.update({

            where: {

              id: avaliacaoExistente.id

            },

            data: dadosAvaliacao

          });

          atualizadas++;

        } else {

          await prisma.avaliacaoTAF.create({

            data: dadosAvaliacao

          });

          importadas++;

        }

      } catch (erro) {

        ignoradas++;

        erros.push({

          militarId: avaliacao.militarId,

          motivo: erro.message

        });

      }

    }

    return res.status(200).json({

      sucesso: true,

      campanha: campanha.numeroTAF,

      chamada: chamada.numeroChamada,

      totalRecebidas: dados.avaliacoes.length,

      importadas,

      atualizadas,

      ignoradas,

      erros

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error: error.message

    });

  }

}