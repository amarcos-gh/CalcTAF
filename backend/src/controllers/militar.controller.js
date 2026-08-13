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

export async function listarMilitares(req, res) {

  console.log("=== listarMilitares ===");
  console.log("req.query:", req.query);

  try {

    const { omId } = req.query;

    if (!omId) {
      console.log("OM não informada");
      return res.status(400).json({
        error: "OM não informada."
      });
    }

    console.log("Consultando OM:", omId);

    const militares = await prisma.militar.findMany({

      where: {
        omId: Number(omId)
      },

      include: {
        postoGraduacao: true,
        curso: true,
        subunidade: true,

        avaliacoes: {

          include: {

            chamada: {

              include: {

                campanha: true

              }

            }

          }

        }

      },

      orderBy: {
        nomeCompleto: "asc"
      }

    });

console.dir(

  militares[0],

  {

    depth: null

  }

);

console.log(

  "Militares encontrados:",

  militares.length

);


    console.log("Militares encontrados:", militares.length);

    const militaresComPrimeiraChamada = militares.map((militar) => {

    const avaliacaoPrimeiraChamada = militar.avaliacoes.find(

      (avaliacao) =>

        avaliacao.chamada.numeroChamada === 1

    );

    return {

      ...militar,

      avaliacaoPrimeiraChamada

    };

  });

    console.log(
    JSON.stringify(
      militaresComPrimeiraChamada[0],
      null,
      2
    )
  );

  return res.json(

    militaresComPrimeiraChamada

  );

  } catch (error) {

    console.error("ERRO listarMilitares:", error);

    return res.status(500).json({
      error: error.message
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

export async function importarMilitares(req, res) {

  try {

    const omId = Number(req.usuario?.omId);

    if (!omId) {

      return res.status(400).json({

        error:
          "OM do usuário não identificada."

      });

    }

    const {

      militares

    } = req.body;

    if (!Array.isArray(militares)) {

      return res.status(400).json({

        error:
          "Lista de militares não informada."

      });

    }

    if (militares.length === 0) {

      return res.status(400).json({

        error:
          "A planilha não possui militares."

      });

    }

    let processados = 0;

    let atualizados = 0;

    let cadastrados = 0;

    let inconsistencias = [];

    for (let i = 0; i < militares.length; i++) {

      const militar = militares[i];

      const linha = i + 2;

      if (!militar?.nomeCompleto?.trim()) {

        inconsistencias.push({

          linha,

          nome:
            "",

          motivo:
            "Nome Completo não informado."

        });

        continue;

      }

      const nomeCompleto =
        militar.nomeCompleto.trim();

            const pg =

        militar.pg?.trim();

      const nomeGuerra =

        militar.nomeGuerra?.trim();

      const segmento =

        militar.segmento?.trim().toUpperCase();

      const cursoCodigo =

        militar.curso?.trim();

      const dataNascimento =

        militar.dataNascimento?.trim();

      const subunidade =

        militar.subunidade?.trim();


      // ==========================================
      // VALIDAÇÃO DOS CAMPOS
      // ==========================================

      if (!pg) {

        inconsistencias.push({

          linha,

          nome: nomeCompleto,

          motivo:
            "PG não informada."

        });

        continue;

      }

      if (!nomeGuerra) {

        inconsistencias.push({

          linha,

          nome: nomeCompleto,

          motivo:
            "Nome Guerra não informado."

        });

        continue;

      }

      if (

        segmento !== "M" &&

        segmento !== "F"

      ) {

        inconsistencias.push({

          linha,

          nome: nomeCompleto,

          motivo:
            "Segmento inválido. Use M ou F."

        });

        continue;

      }

      if (!cursoCodigo) {

        inconsistencias.push({

          linha,

          nome: nomeCompleto,

          motivo:
            "Curso não informado."

        });

        continue;

      }

      if (!dataNascimento) {

        inconsistencias.push({

          linha,

          nome: nomeCompleto,

          motivo:
            "Data de Nascimento não informada."

        });

        continue;

      }

      if (!subunidade) {

        inconsistencias.push({

          linha,

          nome: nomeCompleto,

          motivo:
            "Subunidade não informada."

        });

        continue;

      }

      // ==========================================
      // LOCALIZAR POSTO / GRADUAÇÃO
      // ==========================================

      const postoGraduacao =

        await prisma.postoGraduacao.findFirst({

          where: {

            abreviacao: pg

          }

        });

      if (!postoGraduacao) {

        inconsistencias.push({

          linha,

          nome: nomeCompleto,

          motivo:
            `PG "${pg}" não encontrada.`

        });

        continue;

      }

      // ==========================================
      // LOCALIZAR CURSO
      // ==========================================

      const curso =

        await prisma.curso.findFirst({

          where: {

            codigo: cursoCodigo

          }

        });

      if (!curso) {

        inconsistencias.push({

          linha,

          nome: nomeCompleto,

          motivo:
            `Curso "${cursoCodigo}" não encontrado.`

        });

        continue;

      }

      // ==========================================
      // VALIDAR DATA
      // ==========================================

      const partesData =

        dataNascimento.split("/");

      if (

        partesData.length !== 3

      ) {

        inconsistencias.push({

          linha,

          nome: nomeCompleto,

          motivo:
            "Data de Nascimento inválida. Use DD/MM/AAAA."

        });

        continue;

      }

      const dia =

        Number(partesData[0]);

      const mes =

        Number(partesData[1]);

      const ano =

        Number(partesData[2]);

      const dataConvertida =

        new Date(

          ano,

          mes - 1,

          dia

        );

      if (

        Number.isNaN(

          dataConvertida.getTime()

        ) ||

        dataConvertida.getDate() !== dia ||

        dataConvertida.getMonth() !== mes - 1 ||

        dataConvertida.getFullYear() !== ano

      ) {

        inconsistencias.push({

          linha,

          nome: nomeCompleto,

          motivo:
            "Data de Nascimento inválida. Use DD/MM/AAAA."

        });

        continue;

      }

      // ==========================================
      // LOCALIZAR / CRIAR SUBUNIDADE
      // ==========================================

      let subunidadeExistente =

        await prisma.subunidade.findFirst({

          where: {

            nome: subunidade,

            omId

          }

        });

      if (!subunidadeExistente) {

        subunidadeExistente =

          await prisma.subunidade.create({

            data: {

              nome: subunidade,

              omId

            }

          });

      }

      // ==========================================
      // LOCALIZAR MILITAR NA MESMA OM
      // ==========================================

      const militarExistente =

        await prisma.militar.findFirst({

          where: {

            nomeCompleto,

            omId

          }

        });

      // ==========================================
      // ATUALIZAR MILITAR EXISTENTE
      // ==========================================

      if (militarExistente) {

        await prisma.militar.update({

          where: {

            id: militarExistente.id

          },

          data: {

            nomeCompleto,

            nomeGuerra,

            segmento,

            dataNascimento: dataConvertida,

            postoGraduacaoId:
              postoGraduacao.id,

            cursoId:
              curso.id,

            subunidadeId:
              subunidadeExistente.id

          }

        });

        atualizados++;

      }

      // ==========================================
      // CADASTRAR NOVO MILITAR
      // ==========================================

      else {

        await prisma.militar.create({

          data: {

            nomeCompleto,

            nomeGuerra,

            segmento,

            dataNascimento:
              dataConvertida,

            om: {

              connect: {

                id: omId

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
                  postoGraduacao.id

              }

            },

            curso: {

              connect: {

                id:
                  curso.id

              }

            }

          }

        });

        cadastrados++;

      }


      processados++;

    }

    // ==========================================
    // RESULTADO DA IMPORTAÇÃO
    // ==========================================

    return res.status(200).json({

      sucesso: true,

      total:

        militares.length,

      processados,

      cadastrados,

      atualizados,

      inconsistencias

    });

    } catch (error) {

    console.error(

      "ERRO IMPORTAR MILITARES:",

      error

    );

    return res.status(500).json({

      sucesso: false,

      error:

        error.message

    });

  }

}