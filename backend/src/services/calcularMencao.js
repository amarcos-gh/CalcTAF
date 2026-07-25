import prisma from "../config/prisma.js";

export default async function calcularMencao({

  segmento,
  cursoCodigo,
  exercicio,
  idade,
  valor

}) {

  if (

    idade == null ||

    valor == null ||

    !segmento ||

    !cursoCodigo ||

    !exercicio

  ) {

    return "NR";
  }

  const segmentoNormalizado =

    String(segmento)
      .trim()
      .toUpperCase();

  let cursoNormalizado =

    String(cursoCodigo)
      .trim()
      .toUpperCase();

    if (

      cursoNormalizado === "LEMC"

      ||

      cursoNormalizado === "LEMCT"

    ) {

      cursoNormalizado = "LEMS";
  }

  const exercicioNormalizado =

    String(exercicio)
      .trim()
      .toUpperCase();

  const indices =

    await prisma.indiceTAF.findMany({

      where: {

        segmento:

          segmentoNormalizado,

        cursoCodigo:

          cursoNormalizado,

        exercicio:

          exercicioNormalizado,

        idadeMin: {

          lte:
            idade
        }
      },

      orderBy: [

        {

          valorMin:
            "desc"
        }
      ]
    });

  for (

    const indice

    of

    indices

  ) {

    const idadeValida =

      indice.idadeMax == null

      ||

      idade <=

      indice.idadeMax;

    const minOk =

      indice.valorMin == null

      ||

      valor >=

      indice.valorMin;

    const maxOk =

      indice.valorMax == null

      ||

      valor <=

      indice.valorMax;

    if (

      idadeValida

      &&

      minOk

      &&

      maxOk

    ) {

      return (

        indice.mencao ||

        "NR"
      );
    }
  }

  console.log({

    erroIndice: true,

    segmento:
      segmentoNormalizado,

    curso:
      cursoNormalizado,

    exercicio:
      exercicioNormalizado,

    idade,

    valor
  });

  return "NR";
}