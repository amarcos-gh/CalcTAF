import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  // ==========================================================
  // POSTOS E GRADUAÇÕES
  // ==========================================================

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 1
    },
    update: {
      nome: "Coronel",
      abreviacao: "Cel"
    },
    create: {
      nome: "Coronel",
      abreviacao: "Cel",
      ordem: 1
    }
  });

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 2
    },
    update: {
      nome: "Tenente-Coronel",
      abreviacao: "TC"
    },
    create: {
      nome: "Tenente-Coronel",
      abreviacao: "TC",
      ordem: 2
    }
  });

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 3
    },
    update: {
      nome: "Major",
      abreviacao: "Maj"
    },
    create: {
      nome: "Major",
      abreviacao: "Maj",
      ordem: 3
    }
  });

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 4
    },
    update: {
      nome: "Capitão",
      abreviacao: "Cap"
    },
    create: {
      nome: "Capitão",
      abreviacao: "Cap",
      ordem: 4
    }
  });

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 5
    },
    update: {
      nome: "Primeiro-Tenente",
      abreviacao: "1\u00BA Ten"
    },
    create: {
      nome: "Primeiro-Tenente",
      abreviacao: "1\u00BA Ten",
      ordem: 5
    }
  });

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 6
    },
    update: {
      nome: "Segundo-Tenente",
      abreviacao: "2\u00BA Ten"
    },
    create: {
      nome: "Segundo-Tenente",
      abreviacao: "2\u00BA Ten",
      ordem: 6
    }
  });

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 7
    },
    update: {
      nome: "Aspirante-a-Oficial",
      abreviacao: "Asp Of"
    },
    create: {
      nome: "Aspirante-a-Oficial",
      abreviacao: "Asp Of",
      ordem: 7
    }
  });

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 8
    },
    update: {
      nome: "Subtenente",
      abreviacao: "ST"
    },
    create: {
      nome: "Subtenente",
      abreviacao: "ST",
      ordem: 8
    }
  });

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 9
    },
    update: {
      nome: "Primeiro-Sargento",
      abreviacao: "1\u00BA Sgt"
    },
    create: {
      nome: "Primeiro-Sargento",
      abreviacao: "1\u00BA Sgt",
      ordem: 9
    }
  });

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 10
    },
    update: {
      nome: "Segundo-Sargento",
      abreviacao: "2\u00BA Sgt"
    },
    create: {
      nome: "Segundo-Sargento",
      abreviacao: "2\u00BA Sgt",
      ordem: 10
    }
  });

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 11
    },
    update: {
      nome: "Terceiro-Sargento",
      abreviacao: "3\u00BA Sgt"
    },
    create: {
      nome: "Terceiro-Sargento",
      abreviacao: "3\u00BA Sgt",
      ordem: 11
    }
  });

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 12
    },
    update: {
      nome: "Cabo",
      abreviacao: "Cb"
    },
    create: {
      nome: "Cabo",
      abreviacao: "Cb",
      ordem: 12
    }
  });

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 13
    },
    update: {
      nome: "Soldado EP",
      abreviacao: "Sd EP"
    },
    create: {
      nome: "Soldado EP",
      abreviacao: "Sd EP",
      ordem: 13
    }
  });

  await prisma.postoGraduacao.upsert({
    where: {
      ordem: 14
    },
    update: {
      nome: "Soldado EV",
      abreviacao: "Sd EV"
    },
    create: {
      nome: "Soldado EV",
      abreviacao: "Sd EV",
      ordem: 14
    }
  });


  // ==========================================================
  // CURSOS
  // ==========================================================

  await prisma.curso.createMany({

    skipDuplicates: true,

    data: [

      {
        nome: "Linha de Ensino Militar Bélico",
        codigo: "LEMB"
      },

      {
        nome: "Linha de Ensino Militar de Saúde",
        codigo: "LEMS"
      },

      {
        nome: "Linha de Ensino Militar Complementar",
        codigo: "LEMC"
      },

      {
        nome: "Linha de Ensino Militar Científico-Tecnológico",
        codigo: "LEMCT"
      }

    ]

  });


  // ==========================================================
  // CAMPANHAS TAF
  // ==========================================================

  await prisma.campanhaTAF.createMany({

    skipDuplicates: true,

    data: [

      {
        ano: 2026,
        numeroTAF: 1
      },

      {
        ano: 2026,
        numeroTAF: 2
      },

      {
        ano: 2026,
        numeroTAF: 3
      }

    ]

  });


  // ==========================================================
  // LOCALIZAR CAMPANHAS
  // ==========================================================

  const taf1 =
    await prisma.campanhaTAF.findFirst({

      where: {

        ano: 2026,

        numeroTAF: 1

      }

    });

  const taf2 =
    await prisma.campanhaTAF.findFirst({

      where: {

        ano: 2026,

        numeroTAF: 2

      }

    });

  const taf3 =
    await prisma.campanhaTAF.findFirst({

      where: {

        ano: 2026,

        numeroTAF: 3

      }

    });


  // ==========================================================
  // CHAMADAS DO TAF
  // ==========================================================

  await prisma.chamadaTAF.createMany({

    skipDuplicates: true,

    data: [

      // 1º TAF

      {
        numeroChamada: 1,
        periodoInicio:
          new Date("2026-03-01"),
        periodoFim:
          new Date("2026-03-05"),
        campanhaId:
          taf1.id
      },

      {
        numeroChamada: 2,
        periodoInicio:
          new Date("2026-03-10"),
        periodoFim:
          new Date("2026-03-12"),
        campanhaId:
          taf1.id
      },


      // 2º TAF

      {
        numeroChamada: 1,
        periodoInicio:
          new Date("2026-07-01"),
        periodoFim:
          new Date("2026-07-05"),
        campanhaId:
          taf2.id
      },

      {
        numeroChamada: 2,
        periodoInicio:
          new Date("2026-07-10"),
        periodoFim:
          new Date("2026-07-12"),
        campanhaId:
          taf2.id
      },


      // 3º TAF

      {
        numeroChamada: 1,
        periodoInicio:
          new Date("2026-11-01"),
        periodoFim:
          new Date("2026-11-05"),
        campanhaId:
          taf3.id
      },

      {
        numeroChamada: 2,
        periodoInicio:
          new Date("2026-11-10"),
        periodoFim:
          new Date("2026-11-12"),
        campanhaId:
          taf3.id
      }

    ]

  });


  console.log(
    "Seed executada com sucesso."
  );

}


// ==========================================================
// EXECUÇÃO
// ==========================================================

main()

  .catch((erro) => {

    console.error(
      "Erro durante o seed:"
    );

    console.error(erro);

    process.exit(1);

  })

  .finally(async () => {

    await prisma.$disconnect();

  });