const DB_NAME = "CalcTAFCampo";

const DB_VERSION = 1;

// ======================================================
// CONFIGURAÇÕES DO APLICATIVO
// ======================================================

const MAX_TENTATIVAS_LOGIN = 5;

const TEMPO_BLOQUEIO_MINUTOS = 15;

// ======================================================
// STORES
// ======================================================

const STORES = {

  COLETA: "coleta",

  MILITARES: "militares",

  AVALIACOES: "avaliacoes",

  CONFIG: "config",

  INDICES_TAF: "indicesTAF"

};

// ======================================================
// ABRIR BANCO
// ======================================================

function abrirBanco() {

  return new Promise((resolve, reject) => {

    const request = indexedDB.open(

      DB_NAME,

      DB_VERSION

    );

    request.onupgradeneeded = () => {

      const db = request.result;

      // ===============================
      // COLETA
      // ===============================

      if (

        !db.objectStoreNames.contains(

          STORES.COLETA

        )

      ) {

        db.createObjectStore(

          STORES.COLETA,

          {

            keyPath: "id"

          }

        );

      }

      // ===============================
      // MILITARES
      // ===============================

      if (

        !db.objectStoreNames.contains(

          STORES.MILITARES

        )

      ) {

        const store = db.createObjectStore(

          STORES.MILITARES,

          {

            keyPath: "id"

          }

        );

        store.createIndex(

          "nomeGuerra",

          "nomeGuerra",

          {

            unique: false

          }

        );

        store.createIndex(

          "nomeCompleto",

          "nomeCompleto",

          {

            unique: false

          }

        );

        store.createIndex(

          "subunidade",

          "subunidade",

          {

            unique: false

          }

        );

      }

      // ===============================
      // AVALIAÇÕES
      // ===============================

      if (

        !db.objectStoreNames.contains(

          STORES.AVALIACOES

        )

      ) {

        db.createObjectStore(

          STORES.AVALIACOES,

          {

            keyPath: "militarId"

          }

        );

      }

      // ===============================
      // CONFIGURAÇÕES
      // ===============================

      if (

        !db.objectStoreNames.contains(

          STORES.CONFIG

        )

      ) {

        db.createObjectStore(

          STORES.CONFIG,

          {

            keyPath: "id"

          }

        );

      }

      // ===============================
      // ÍNDICES TAF
      // ===============================

      if (

        !db.objectStoreNames.contains(

          STORES.INDICES_TAF

        )

      ) {

        db.createObjectStore(

          STORES.INDICES_TAF,

          {

            keyPath: "id"

          }

        );

      }

    };

    request.onsuccess = () => {

      resolve(

        request.result

      );

    };

    request.onerror = () => {

      reject(

        request.error

      );

    };

  });

}

// ======================================================
// IMPORTAR COLETA
// ======================================================

export async function importarColeta(dados) {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      [

        STORES.COLETA,

        STORES.MILITARES,

        STORES.AVALIACOES,

        STORES.CONFIG,

        STORES.INDICES_TAF

      ],

      "readwrite"

    );

    const storeColeta =
      tx.objectStore(STORES.COLETA);

    const storeMilitares =
      tx.objectStore(STORES.MILITARES);

    const storeAvaliacoes =
      tx.objectStore(STORES.AVALIACOES);

    const storeConfig =
      tx.objectStore(STORES.CONFIG);

    const storeIndices =
      tx.objectStore(STORES.INDICES_TAF);

    // =====================================
    // Limpa completamente o banco local
    // =====================================

    storeColeta.clear();

    storeMilitares.clear();

    storeAvaliacoes.clear();

    storeConfig.clear();

    storeIndices.clear();

    // =====================================
    // Dados da coleta
    // =====================================

    storeColeta.put({

      id: 1,

      ...dados,

      importadoEm: new Date().toISOString()

    });

    // =====================================
    // Militares
    // =====================================

    if (

      Array.isArray(dados.militares)

    ) {

      dados.militares.forEach((militar) => {

        storeMilitares.put(militar);

      });

    }

    // =====================================
    // Índices TAF
    // Compatível com versões antigas
    // =====================================

    if (

      Array.isArray(dados.indicesTAF)

    ) {

      dados.indicesTAF.forEach((indice) => {

        storeIndices.put(indice);

      });

    }

    // =====================================
    // Configuração inicial
    // =====================================

    storeConfig.put({

      id: "app",

      tentativasLogin: 0,

      bloqueadoAte: null,

      ultimoLogin: null,

      versaoBanco: DB_VERSION,

      importadoEm: new Date().toISOString()

    });

    tx.oncomplete = () => {

      resolve(true);

    };

    tx.onerror = () => {

      reject(tx.error);

    };

    tx.onabort = () => {

      reject(tx.error);

    };

  });

}

// ======================================================
// OBTER COLETA
// ======================================================

export async function obterColeta() {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      STORES.COLETA,

      "readonly"

    );

    const request = tx
      .objectStore(STORES.COLETA)
      .get(1);

    request.onsuccess = () => {

      resolve(

        request.result || null

      );

    };

    request.onerror = () => {

      reject(

        request.error

      );

    };

  });

}

// ======================================================
// OBTER CONFIGURAÇÃO
// ======================================================

export async function obterConfig() {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      STORES.CONFIG,

      "readonly"

    );

    const request = tx
      .objectStore(STORES.CONFIG)
      .get("app");

    request.onsuccess = () => {

      resolve(

        request.result || null

      );

    };

    request.onerror = () => {

      reject(

        request.error

      );

    };

  });

}

// ======================================================
// SALVAR CONFIGURAÇÃO
// ======================================================

export async function salvarConfig(config) {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      STORES.CONFIG,

      "readwrite"

    );

    tx.objectStore(

      STORES.CONFIG

    ).put(config);

    tx.oncomplete = () => {

      resolve(true);

    };

    tx.onerror = () => {

      reject(tx.error);

    };

  });

}

// ======================================================
// INCREMENTAR TENTATIVAS
// ======================================================

export async function incrementarTentativas() {

  const config = await obterConfig();

  if (!config) {

    return null;

  }

  config.tentativasLogin++;

  const tentativasRestantes =

    MAX_TENTATIVAS_LOGIN -

    config.tentativasLogin;

  if (

    config.tentativasLogin >=

    MAX_TENTATIVAS_LOGIN

  ) {

    config.bloqueadoAte = new Date(

      Date.now() +

      (TEMPO_BLOQUEIO_MINUTOS * 60 * 1000)

    ).toISOString();

  }

  await salvarConfig(config);

  return {

    ...config,

    tentativasRestantes

  };

}

// ======================================================
// RESETAR TENTATIVAS
// ======================================================

export async function resetarTentativas() {

  const config = await obterConfig();

  if (!config) {

    return;

  }

  config.tentativasLogin = 0;

  config.bloqueadoAte = null;

  await salvarConfig(config);

}

// ======================================================
// REGISTRAR LOGIN
// ======================================================

export async function registrarLogin() {

  const config = await obterConfig();

  if (!config) {

    return;

  }

  config.ultimoLogin =

    new Date().toISOString();

  config.tentativasLogin = 0;

  config.bloqueadoAte = null;

  await salvarConfig(config);

}

// ======================================================
// LOGIN BLOQUEADO
// ======================================================

export async function loginBloqueado() {

  const config = await obterConfig();

  if (!config?.bloqueadoAte) {

    return false;

  }

  return (

    new Date() <

    new Date(config.bloqueadoAte)

  );

}

// ======================================================
// LISTAR MILITARES
// ======================================================

export async function listarMilitares() {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      STORES.MILITARES,

      "readonly"

    );

    const request = tx
      .objectStore(STORES.MILITARES)
      .getAll();

    request.onsuccess = () => {

      const militares = request.result.sort((a, b) =>

        a.nomeGuerra.localeCompare(

          b.nomeGuerra,

          "pt-BR"

        )

      );

      resolve(militares);

    };

    request.onerror = () => {

      reject(request.error);

    };

  });

}

// ======================================================
// OBTER MILITAR
// ======================================================

export async function obterMilitar(id) {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      STORES.MILITARES,

      "readonly"

    );

    const request = tx
      .objectStore(STORES.MILITARES)
      .get(id);

    request.onsuccess = () => {

      resolve(

        request.result || null

      );

    };

    request.onerror = () => {

      reject(request.error);

    };

  });

}

// ======================================================
// PESQUISAR MILITARES
// ======================================================

export async function pesquisarMilitares(busca) {

  const militares = await listarMilitares();

  if (

    !busca ||

    busca.trim().length < 1

  ) {

    return [];

  }

  const texto = busca
    .trim()
    .toUpperCase();

  return militares.filter((militar) => {

    const nomeGuerra =

      militar.nomeGuerra?.toUpperCase() || "";

    const nomeCompleto =

      militar.nomeCompleto?.toUpperCase() || "";

    return (

      nomeGuerra.includes(texto) ||

      nomeCompleto.includes(texto)

    );

  });

}

// ======================================================
// SALVAR ÍNDICES TAF
// ======================================================

export async function salvarIndicesTAF(indices) {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      STORES.INDICES_TAF,

      "readwrite"

    );

    const store =
      tx.objectStore(STORES.INDICES_TAF);

    store.clear();

    if (

      Array.isArray(indices)

    ) {

      indices.forEach((indice) => {

        store.put(indice);

      });

    }

    tx.oncomplete = () => {

      resolve(true);

    };

    tx.onerror = () => {

      reject(tx.error);

    };

  });

}

// ======================================================
// LISTAR ÍNDICES TAF
// ======================================================

export async function listarIndicesTAF() {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      STORES.INDICES_TAF,

      "readonly"

    );

    const request = tx
      .objectStore(STORES.INDICES_TAF)
      .getAll();

    request.onsuccess = () => {

      resolve(

        request.result

      );

    };

    request.onerror = () => {

      reject(request.error);

    };

  });

}

// ======================================================
// BUSCAR ÍNDICE TAF
// ======================================================

export async function buscarIndiceTAF(id) {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      STORES.INDICES_TAF,

      "readonly"

    );

    const request = tx
      .objectStore(STORES.INDICES_TAF)
      .get(id);

    request.onsuccess = () => {

      resolve(

        request.result || null

      );

    };

    request.onerror = () => {

      reject(request.error);

    };

  });

}

// ======================================================
// LIMPAR ÍNDICES TAF
// ======================================================

export async function limparIndicesTAF() {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      STORES.INDICES_TAF,

      "readwrite"

    );

    tx.objectStore(

      STORES.INDICES_TAF

    ).clear();

    tx.oncomplete = () => {

      resolve(true);

    };

    tx.onerror = () => {

      reject(tx.error);

    };

  });

}

// ======================================================
// SALVAR AVALIAÇÃO
// ======================================================

export async function salvarAvaliacao(avaliacao) {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      STORES.AVALIACOES,

      "readwrite"

    );

    tx.objectStore(

      STORES.AVALIACOES

    ).put({

      ...avaliacao,

      dataAtualizacao:

        new Date().toISOString(),

      sincronizado: false

    });

    tx.oncomplete = () => {

      resolve(true);

    };

    tx.onerror = () => {

      reject(tx.error);

    };

  });

}

// ======================================================
// BUSCAR AVALIAÇÃO
// ======================================================

export async function buscarAvaliacao(militarId) {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      STORES.AVALIACOES,

      "readonly"

    );

    const request = tx
      .objectStore(STORES.AVALIACOES)
      .get(militarId);

    request.onsuccess = () => {

      resolve(

        request.result || null

      );

    };

    request.onerror = () => {

      reject(

        request.error

      );

    };

  });

}

// ======================================================
// MILITAR JÁ AVALIADO
// ======================================================

export async function militarAvaliado(militarId) {

  const avaliacao = await buscarAvaliacao(

    militarId

  );

  return avaliacao !== null;

}

// ======================================================
// LISTAR AVALIAÇÕES
// ======================================================

export async function listarAvaliacoes() {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      STORES.AVALIACOES,

      "readonly"

    );

    const request = tx
      .objectStore(STORES.AVALIACOES)
      .getAll();

    request.onsuccess = () => {

      const avaliacoes = request.result.sort(

        (a, b) => {

          if (

            a.nomeGuerra &&

            b.nomeGuerra

          ) {

            return a.nomeGuerra.localeCompare(

              b.nomeGuerra,

              "pt-BR"

            );

          }

          return 0;

        }

      );

      resolve(avaliacoes);

    };

    request.onerror = () => {

      reject(

        request.error

      );

    };

  });

}

// ======================================================
// CONTAR AVALIAÇÕES
// ======================================================

export async function contarAvaliacoes() {

  const militares = await listarMilitares();

  const avaliacoes = await listarAvaliacoes();

  return {

    totalMilitares:

      militares.length,

    totalAvaliados:

      avaliacoes.length,

    pendentes:

      militares.length -

      avaliacoes.length

  };

}

// ======================================================
// EXPORTAR AVALIAÇÕES
// ======================================================

export async function exportarAvaliacoes() {

  const coleta = await obterColeta();

  const avaliacoes = await listarAvaliacoes();

  return {

    versao: "1.0",

    tipo: "AVALIACOES",

    exportadoEm: new Date().toISOString(),

    om: coleta?.om ?? null,

    subunidade:

      coleta?.subunidade ??

      coleta?.su ??

      null,

    avaliador:

      coleta?.avaliador ??

      null,

    email:

      coleta?.email ??

      null,

    hash:

      coleta?.hash ??

      null,

    campanha:

      coleta?.campanha ?? null,

    numeroTAF:

      coleta?.campanha?.numeroTAF ?? null,

    numeroChamada:

      coleta?.campanha?.numeroChamada ?? null,

    avaliacoes

  };

}

// ======================================================
// LIMPAR BANCO
// ======================================================

export async function limparBanco() {

  const db = await abrirBanco();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(

      [

        STORES.COLETA,

        STORES.MILITARES,

        STORES.AVALIACOES,

        STORES.CONFIG,

        STORES.INDICES_TAF

      ],

      "readwrite"

    );

    tx.objectStore(

      STORES.COLETA

    ).clear();

    tx.objectStore(

      STORES.MILITARES

    ).clear();

    tx.objectStore(

      STORES.AVALIACOES

    ).clear();

    tx.objectStore(

      STORES.CONFIG

    ).clear();

    tx.objectStore(

      STORES.INDICES_TAF

    ).clear();

    tx.oncomplete = () => {

      resolve(true);

    };

    tx.onerror = () => {

      reject(tx.error);

    };

  });

}