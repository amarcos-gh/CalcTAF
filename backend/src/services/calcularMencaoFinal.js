export default function calcularMencaoFinal({

  mencaoCorrida,

  mencaoFlexao,

  mencaoAbdominal,

  mencaoBarra

}) {

  const pesos = {

    E: 5,

    MB: 4,

    B: 3,

    R: 2,

    S: 2,

    I: 1,

    NR: 0
  };

  const mencoes = [

    mencaoCorrida,

    mencaoFlexao,

    mencaoAbdominal,

    mencaoBarra

  ].filter(

    (mencao) =>

      mencao != null

      &&

      mencao !== ""

      &&

      mencao !== "NF"
  );

  if (

    !mencoes.length

  ) {

    return "NR";
  }

  let piorMencao =

    mencoes[0];

  for (

    const mencao

    of

    mencoes

  ) {

    if (

      (pesos[mencao] ?? 0)

      <

      (pesos[piorMencao] ?? 0)

    ) {

      piorMencao =
        mencao;
    }
  }

  return piorMencao;
}