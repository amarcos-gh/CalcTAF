// ======================================================
// CalcTAF Campo
// Serviço de Cálculo do TAF
// ======================================================

import { listarIndicesTAF } from "../database/indexedDB";

// ======================================================
// MENÇÕES
// ======================================================

export const MENCOES = Object.freeze({
  NR: "NR",
  I: "I",
  R: "R",
  B: "B",
  MB: "MB",
  E: "E",
  A: "A",
  NA: "NA",
  NF: "NF"
});

// ======================================================
// ORDEM DAS MENÇÕES
// ======================================================

const ORDEM_MENCOES = [
  MENCOES.I,
  MENCOES.R,
  MENCOES.B,
  MENCOES.MB,
  MENCOES.E
];

// ======================================================
// NORMALIZAR TEXTO
// ======================================================

function normalizarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .toUpperCase();
}

// ======================================================
// NORMALIZAR NÚMERO
// ======================================================

function normalizarNumero(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null;
  }

  const numero = Number(valor);

  return Number.isNaN(numero)
    ? null
    : numero;
}

// ======================================================
// NORMALIZAR CURSO
// ======================================================

function normalizarCurso(curso) {
  return normalizarTexto(curso);
}

// ======================================================
// CURSO ESPECIAL
// LEMS / LEMC / LEMCT
// ======================================================

function cursoEspecial(curso) {
  return [
    "LEMS",
    "LEMC",
    "LEMCT"
  ].includes(normalizarCurso(curso));
}

// ======================================================
// BUSCAR TODOS OS ÍNDICES
// ======================================================

async function obterTabelaIndices() {
  const tabela = await listarIndicesTAF();

  return Array.isArray(tabela)
    ? tabela
    : [];
}

// ======================================================
// COMPARAR MENÇÕES
// ======================================================

function piorMencao(atual, nova) {
  const indiceAtual = ORDEM_MENCOES.indexOf(atual);
  const indiceNova = ORDEM_MENCOES.indexOf(nova);

  if (indiceAtual === -1) {
    return nova;
  }

  if (indiceNova === -1) {
    return atual;
  }

  return indiceNova < indiceAtual
    ? nova
    : atual;
}

// ======================================================
// BUSCAR ÍNDICE TAF
// ======================================================

async function buscarIndiceTAF({
  segmento,
  curso,
  exercicio,
  idade,
  valor
}) {
  const tabela = await obterTabelaIndices();

  const segmentoNormalizado = normalizarTexto(segmento);
  const cursoNormalizado = normalizarCurso(curso);
  const exercicioNormalizado = normalizarTexto(exercicio);
  const idadeNormalizada = normalizarNumero(idade);
  const valorNormalizado = normalizarNumero(valor);

  if (
    idadeNormalizada === null ||
    valorNormalizado === null
  ) {
    return null;
  }

  const registros = tabela.filter((indice) => {
    if (
      normalizarTexto(indice.segmento) !==
      segmentoNormalizado
    ) {
      return false;
    }

    if (
      normalizarCurso(indice.cursoCodigo) !==
      cursoNormalizado
    ) {
      return false;
    }

    if (
      normalizarTexto(indice.exercicio) !==
      exercicioNormalizado
    ) {
      return false;
    }

    const idadeMin = Number(indice.idadeMin);
    const idadeMax = Number(indice.idadeMax);

    if (
      idadeNormalizada < idadeMin ||
      idadeNormalizada > idadeMax
    ) {
      return false;
    }

    const valorMin =
      indice.valorMin === null ||
      indice.valorMin === undefined
        ? Number.NEGATIVE_INFINITY
        : Number(indice.valorMin);

    const valorMax =
      indice.valorMax === null ||
      indice.valorMax === undefined
        ? Number.POSITIVE_INFINITY
        : Number(indice.valorMax);

    return (
      valorNormalizado >= valorMin &&
      valorNormalizado <= valorMax
    );
  });

  if (registros.length === 0) {
    return null;
  }

  if (registros.length > 1) {
    throw new Error(
      `Faixas duplicadas encontradas para ${segmentoNormalizado} / ${cursoNormalizado} / ${exercicioNormalizado} / idade ${idadeNormalizada}.`
    );
  }

  return registros[0];
}

// ======================================================
// BUSCAR MENÇÃO
// ======================================================

async function buscarMencao(dados) {
  const registro = await buscarIndiceTAF(dados);

  return registro
    ? registro.mencao
    : MENCOES.NR;
}

// ======================================================
// CALCULAR MENÇÃO
// ======================================================

export async function calcularMencao({
  segmento,
  curso,
  exercicio,
  idade,
  valor
}) {
  const valorNormalizado = normalizarNumero(valor);

  if (valorNormalizado === null) {
    return MENCOES.NR;
  }

  return await buscarMencao({
    segmento,
    curso,
    exercicio,
    idade,
    valor: valorNormalizado
  });
}

// ======================================================
// CORRIDA
// ======================================================

export async function calcularCorrida(
  segmento,
  curso,
  idade,
  valor
) {
  return await calcularMencao({
    segmento,
    curso,
    exercicio: "CORRIDA",
    idade,
    valor
  });
}

// ======================================================
// FLEXÃO DE BRAÇOS
// ======================================================

export async function calcularFlexao(
  segmento,
  curso,
  idade,
  valor
) {
  return await calcularMencao({
    segmento,
    curso,
    exercicio: "FLEXAO",
    idade,
    valor
  });
}

// ======================================================
// ABDOMINAL
// ======================================================

export async function calcularAbdominal(
  segmento,
  curso,
  idade,
  valor
) {
  return await calcularMencao({
    segmento,
    curso,
    exercicio: "ABDOMINAL",
    idade,
    valor
  });
}

// ======================================================
// BARRA
// ======================================================

export async function calcularBarra(
  segmento,
  curso,
  idade,
  valor
) {
  if (
    cursoEspecial(curso) ||
    Number(idade) >= 50
  ) {
    return MENCOES.NF;
  }

  return await calcularMencao({
    segmento,
    curso,
    exercicio: "BARRA",
    idade,
    valor
  });
}

// ======================================================
// PPM
// ======================================================

export async function calcularPPM(
  segmento,
  curso,
  idade,
  valor
) {
  if (
    cursoEspecial(curso) ||
    Number(idade) >= 40
  ) {
    return MENCOES.NF;
  }

  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return MENCOES.NR;
  }

  const resultado = normalizarTexto(valor);

  if (
    resultado !== MENCOES.A &&
    resultado !== MENCOES.NA
  ) {
    return MENCOES.NR;
  }

  return resultado;
}

// ======================================================
// REGRAS ESPECIAIS
// ======================================================

export function aplicarRegrasEspeciais({
  curso,
  idade,
  barra,
  ppm
}) {
  const resultado = {
    barra,
    ppm
  };

  if (cursoEspecial(curso)) {
    resultado.barra = MENCOES.NF;
    resultado.ppm = MENCOES.NF;
    return resultado;
  }

  if (Number(idade) >= 50) {
    resultado.barra = MENCOES.NF;
  }

  if (Number(idade) >= 40) {
    resultado.ppm = MENCOES.NF;
  }

  return resultado;
}

// ======================================================
// CALCULAR MENÇÃO FINAL
// ======================================================

export function calcularMencaoFinal({
  corrida,
  flexao,
  abdominal,
  barra,
  ppm
}) {
  let pior = null;

  const mencoes = [
    corrida,
    flexao,
    abdominal,
    barra,
    ppm
  ];

  for (const mencao of mencoes) {

    if (
      mencao === null ||
      mencao === undefined ||
      mencao === MENCOES.NR ||
      mencao === MENCOES.NF ||
      mencao === MENCOES.A ||
      mencao === MENCOES.NA
    ) {
      continue;
    }

    if (pior === null) {
      pior = mencao;
      continue;
    }

    pior = piorMencao(
      pior,
      mencao
    );
  }

  return pior ?? MENCOES.NR;
}

// ======================================================
// PROCESSAR AVALIAÇÃO
// ======================================================

export async function processarAvaliacao({
  segmento,
  curso,
  idade,
  corrida,
  flexao,
  abdominal,
  barra,
  ppm
}) {

  const mencaoCorrida =
    await calcularCorrida(
      segmento,
      curso,
      idade,
      corrida
    );

  const mencaoFlexao =
    await calcularFlexao(
      segmento,
      curso,
      idade,
      flexao
    );

  const mencaoAbdominal =
    await calcularAbdominal(
      segmento,
      curso,
      idade,
      abdominal
    );

  const mencaoBarra =
    await calcularBarra(
      segmento,
      curso,
      idade,
      barra
    );

  const mencaoPPM =
    await calcularPPM(
      segmento,
      curso,
      idade,
      ppm
    );

  const regras =
    aplicarRegrasEspeciais({
      curso,
      idade,
      barra: mencaoBarra,
      ppm: mencaoPPM
    });

  const mencaoFinal =
    calcularMencaoFinal({
      corrida: mencaoCorrida,
      flexao: mencaoFlexao,
      abdominal: mencaoAbdominal,
      barra: regras.barra,
      ppm: regras.ppm
    });

  return {

    // Índices informados

    corrida,
    flexao,
    abdominal,
    barra,
    ppm,

    // Menções calculadas

    mencaoCorrida,
    mencaoFlexao,
    mencaoAbdominal,
    mencaoBarra: regras.barra,
    mencaoPPM: regras.ppm,

    // Resultado da avaliação

    mencaoFinal

  };
}