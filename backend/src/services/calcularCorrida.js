import prisma from "../config/prisma.js";

export async function calcularMencaoCorrida({
  segmento,
  cursoCodigo,
  idade,
  valor
}) {

  // NORMALIZAÇÃO
  const segmentoNormalizado =
    segmento?.trim().toUpperCase();

  const cursoNormalizado =
    cursoCodigo?.trim().toUpperCase();

  const exercicioNormalizado =
    "CORRIDA";

  console.log("DADOS RECEBIDOS:", {
    segmento: segmentoNormalizado,
    cursoCodigo: cursoNormalizado,
    idade,
    valor
  });

  const indices = await prisma.indiceTAF.findMany({

    where: {

      segmento: segmentoNormalizado,

      cursoCodigo: cursoNormalizado,

      exercicio: exercicioNormalizado,

      idadeMin: {
        lte: idade
      },

      idadeMax: {
        gte: idade
      }
    },

    orderBy: {
      valorMin: "desc"
    }
  });

  console.log("INDICES ENCONTRADOS:");
  console.log(indices);

  for (const indice of indices) {

    const minOk =
      indice.valorMin === null ||
      valor >= indice.valorMin;

    const maxOk =
      indice.valorMax === null ||
      valor <= indice.valorMax;

    console.log("TESTANDO INDICE:", {
      mencao: indice.mencao,
      valorMin: indice.valorMin,
      valorMax: indice.valorMax,
      minOk,
      maxOk
    });

    if (minOk && maxOk) {

      console.log("MENÇÃO ENCONTRADA:",
        indice.mencao
      );

      return indice.mencao;
    }
  }

  console.log("NENHUM ÍNDICE ENCONTRADO");

  return "NR";
}