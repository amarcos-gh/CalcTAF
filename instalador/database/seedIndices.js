import prisma from "../src/config/prisma.js";

import {

  corrida12minMasculinoLEMB,

  flexaoBracosMasculinoLEMB,

  abdominalSupraMasculinoLEMB,

  barraFixaMasculinoLEMB

} from "../src/regras/indicesMasculinoLEMB.js";

import {

corrida12minFemininoLEMB,

flexaoBracosFemininoLEMB,

abdominalSupraFemininoLEMB,

barraFixaFemininoLEMB

} from "../src/regras/indicesFemininoLEMB.js";

import {

corrida12minMasculinoLEMS_LEMC_LEMCT,

flexaoBracosMasculinoLEMS_LEMC_LEMCT,

abdominalSupraMasculinoLEMS_LEMC_LEMCT

} from "../src/regras/indicesMasculinoLEMS_LEMC_LEMCT.js";

import {

corrida12minFemininoLEMS_LEMC_LEMCT,

flexaoBracosFemininoLEMS_LEMC_LEMCT,

abdominalSupraFemininoLEMS_LEMC_LEMCT

} from "../src/regras/indicesFemininoLEMS_LEMC_LEMCT.js";


/*
=====================================
GERADOR DE ÍNDICES
=====================================
*/

function gerarIndicesExercicio({

regras,

exercicio,

segmento,

cursoCodigo

}) {

const indices = [];

for (

const faixa

of

regras

) {

/*
=====================================
SUFICIÊNCIA
=====================================
*/

if (

  faixa.suficiencia

) {

  /*
  =====================================
  INSUFICIENTE
  =====================================
  */

  indices.push({

    segmento,

    cursoCodigo,

    exercicio,

    idadeMin:
      faixa.idadeMin,

    idadeMax:
      faixa.idadeMax,

    valorMin:
      null,

    valorMax:
      faixa.suficiencia - 1,

    mencao:
      "I"
  });

  /*
  =====================================
  SUFICIÊNCIA
  =====================================
  */

  indices.push({

    segmento,

    cursoCodigo,

    exercicio,

    idadeMin:
      faixa.idadeMin,

    idadeMax:
      faixa.idadeMax,

    valorMin:
      faixa.suficiencia,

    valorMax:
      null,

    mencao:
      "S"
  });

  continue;
}

/*
=====================================
INSUFICIENTE
=====================================
*/

indices.push({

  segmento,

  cursoCodigo,

  exercicio,

  idadeMin:
    faixa.idadeMin,

  idadeMax:
    faixa.idadeMax,

  valorMin:
    null,

  valorMax:
    faixa.insuficienteMax,

  mencao:
    "I"
});

/*
=====================================
REGULAR
=====================================
*/

indices.push({

  segmento,

  cursoCodigo,

  exercicio,

  idadeMin:
    faixa.idadeMin,

  idadeMax:
    faixa.idadeMax,

  valorMin:
    faixa.regularMin,

  valorMax:
    faixa.regularMax,

  mencao:
    "R"
});

/*
=====================================
BOM
=====================================
*/

indices.push({

  segmento,

  cursoCodigo,

  exercicio,

  idadeMin:
    faixa.idadeMin,

  idadeMax:
    faixa.idadeMax,

  valorMin:
    faixa.bomMin,

  valorMax:
    faixa.bomMax,

  mencao:
    "B"
});

/*
=====================================
MUITO BOM
=====================================
*/

indices.push({

  segmento,

  cursoCodigo,

  exercicio,

  idadeMin:
    faixa.idadeMin,

  idadeMax:
    faixa.idadeMax,

  valorMin:
    faixa.muitoBomMin,

  valorMax:
    faixa.muitoBomMax,

  mencao:
    "MB"
});

/*
=====================================
EXCELENTE
=====================================
*/

indices.push({

  segmento,

  cursoCodigo,

  exercicio,

  idadeMin:
    faixa.idadeMin,

  idadeMax:
    faixa.idadeMax,

  valorMin:
    faixa.excelenteMin,

  valorMax:
    null,

  mencao:
    "E"
});

}

return indices;
}
/*
=====================================
MAIN
=====================================
*/

async function main() {

  console.log(

    "Limpando índices..."
  );

  await prisma.indiceTAF.deleteMany();

  let indices = [];

  /*
  =====================================
  CORRIDA
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        corrida12minMasculinoLEMB,

      exercicio:
        "CORRIDA",

      segmento:
        "M",

      cursoCodigo:
        "LEMB"
    })
  );

  /*
  =====================================
  FLEXÃO
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        flexaoBracosMasculinoLEMB,

      exercicio:
        "FLEXAO",

      segmento:
        "M",

      cursoCodigo:
        "LEMB"
    })
  );

  /*
  =====================================
  ABDOMINAL
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        abdominalSupraMasculinoLEMB,

      exercicio:
        "ABDOMINAL",

      segmento:
        "M",

      cursoCodigo:
        "LEMB"
    })
  );

  /*
  =====================================
  BARRA
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        barraFixaMasculinoLEMB,

      exercicio:
        "BARRA",

      segmento:
        "M",

      cursoCodigo:
        "LEMB"
    })
  );

  /*
  =====================================
  CORRIDA
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        corrida12minFemininoLEMB,

      exercicio:
        "CORRIDA",

      segmento:
        "F",

      cursoCodigo:
        "LEMB"
    })
  );
  
  /*
  =====================================
  FLEXÃO
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        flexaoBracosFemininoLEMB,

      exercicio:
        "FLEXAO",

      segmento:
        "F",

      cursoCodigo:
        "LEMB"
    })
  );

  /*
  =====================================
  ABDOMINAL
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        abdominalSupraFemininoLEMB,

      exercicio:
        "ABDOMINAL",

      segmento:
        "F",

      cursoCodigo:
        "LEMB"
    })
  );

  /*
  =====================================
  BARRA
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        barraFixaFemininoLEMB,

      exercicio:
        "BARRA",

      segmento:
        "F",

      cursoCodigo:
        "LEMB"
    })
  );

  /*
  =====================================
  CORRIDA
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        corrida12minMasculinoLEMS_LEMC_LEMCT,

      exercicio:
        "CORRIDA",

      segmento:
        "M",

      cursoCodigo:
        "LEMS"
    })
  );

  /*
  =====================================
  FLEXÃO
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        flexaoBracosMasculinoLEMS_LEMC_LEMCT,

      exercicio:
        "FLEXAO",

      segmento:
        "M",

      cursoCodigo:
        "LEMS"
    })
  );

  /*
  =====================================
  ABDOMINAL
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        abdominalSupraMasculinoLEMS_LEMC_LEMCT,

      exercicio:
        "ABDOMINAL",

      segmento:
        "M",

      cursoCodigo:
        "LEMS"
    })
  );

  /*
  =====================================
  CORRIDA
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        corrida12minFemininoLEMS_LEMC_LEMCT,

      exercicio:
        "CORRIDA",

      segmento:
        "F",

      cursoCodigo:
        "LEMS"
    })
  );

  /*
  =====================================
  FLEXÃO
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        flexaoBracosFemininoLEMS_LEMC_LEMCT,

      exercicio:
        "FLEXAO",

      segmento:
        "F",

      cursoCodigo:
        "LEMS"
    })
  );

  /*
  =====================================
  ABDOMINAL
  =====================================
  */

  indices.push(

    ...gerarIndicesExercicio({

      regras:
        abdominalSupraFemininoLEMS_LEMC_LEMCT,

      exercicio:
        "ABDOMINAL",

      segmento:
        "F",

      cursoCodigo:
        "LEMS"
    })
  );

  console.log({

    totalIndices:
      indices.length
  });

  await prisma.indiceTAF.createMany({

    data:
      indices
  });

  console.log(

    "Índices cadastrados com sucesso."
  );
}

main()

  .catch((error) => {

    console.error(

      error
    );
  })

  .finally(async () => {

    await prisma.$disconnect();
  });