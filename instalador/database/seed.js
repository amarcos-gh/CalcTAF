import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.postoGraduacao.createMany({
    skipDuplicates: true,
    data: [
      { nome: "Coronel", abreviacao: "Cel", ordem: 1 },
      { nome: "Tenente-Coronel", abreviacao: "TC", ordem: 2 },
      { nome: "Major", abreviacao: "Maj", ordem: 3 },
      { nome: "Capitão", abreviacao: "Cap", ordem: 4 },
      { nome: "Primeiro-Tenente", abreviacao: "1º Ten", ordem: 5 },
      { nome: "Segundo-Tenente", abreviacao: "2º Ten", ordem: 6 },
      { nome: "Aspirante-a-Oficial", abreviacao: "Asp Of", ordem: 7 },
      { nome: "Subtenente", abreviacao: "ST", ordem: 8 },
      { nome: "Primeiro-Sargento", abreviacao: "1º Sgt", ordem: 9 },
      { nome: "Segundo-Sargento", abreviacao: "2º Sgt", ordem: 10 },
      { nome: "Terceiro-Sargento", abreviacao: "3º Sgt", ordem: 11 },
      { nome: "Cabo", abreviacao: "Cb", ordem: 12 },
      { nome: "Soldado EP", abreviacao: "Sd EP", ordem: 13 },
      { nome: "Soldado EV", abreviacao: "Sd EV", ordem: 14 }
    ]
  });

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

  console.log("Seed executada com sucesso.");
}

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

const taf1 = await prisma.campanhaTAF.findFirst({
    where: {
      ano: 2026,
      numeroTAF: 1
    }
});

const taf2 = await prisma.campanhaTAF.findFirst({
    where: {
      ano: 2026,
      numeroTAF: 2
    }
});

const taf3 = await prisma.campanhaTAF.findFirst({
    where: {
      ano: 2026,
      numeroTAF: 3
    }
});

await prisma.chamadaTAF.createMany({
    skipDuplicates: true,
    data: [

      // 1º TAF
      {
        numeroChamada: 1,
        dataInicio: new Date("2026-03-01"),
        dataFim: new Date("2026-03-05"),
        campanhaId: taf1.id
      },
      {
        numeroChamada: 2,
        dataInicio: new Date("2026-03-10"),
        dataFim: new Date("2026-03-12"),
        campanhaId: taf1.id
      },

      // 2º TAF
      {
        numeroChamada: 1,
        dataInicio: new Date("2026-07-01"),
        dataFim: new Date("2026-07-05"),
        campanhaId: taf2.id
      },
      {
        numeroChamada: 2,
        dataInicio: new Date("2026-07-10"),
        dataFim: new Date("2026-07-12"),
        campanhaId: taf2.id
      },

      // 3º TAF
      {
        numeroChamada: 1,
        dataInicio: new Date("2026-11-01"),
        dataFim: new Date("2026-11-05"),
        campanhaId: taf3.id
      },
      {
        numeroChamada: 2,
        dataInicio: new Date("2026-11-10"),
        dataFim: new Date("2026-11-12"),
        campanhaId: taf3.id
      }
    ]
});

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });