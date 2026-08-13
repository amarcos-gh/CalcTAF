import calcularMencao from "./calcularMencao.js";
import calcularMencaoFinal from "./calcularMencaoFinal.js";
import calcularIdade from "../utils/calcularIdade.js";

export default async function processarAvaliacao({

  militar,

  corrida,

  flexao,

  abdominal,

  barra,

  ppm

}) {

  const idade = calcularIdade(
    militar.dataNascimento
  );

  // TODO:
  // Na próxima etapa vamos mover todo o cálculo
  // atualmente existente em criarAvaliacao().

  return {

    idade

  };

}