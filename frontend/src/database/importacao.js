// ===================================================
// IMPORTAR ARQUIVO DE COLETA
// ===================================================

export async function importarColeta(arquivo) {

  const texto = await arquivo.text();

  let dados;

  try {

    dados = JSON.parse(texto);

  } catch {

    throw new Error("Arquivo inválido.");

  }

  if (!dados) {

    throw new Error("Arquivo vazio.");

  }

  if (!dados.versao) {

    throw new Error("Versão do arquivo não encontrada.");

  }

  if (!dados.om) {

    throw new Error("OM não encontrada no arquivo.");

  }

  if (!dados.campanha) {

    throw new Error("Campanha não encontrada.");

  }

  if (!Array.isArray(dados.militares)) {

    throw new Error("Lista de militares inválida.");

  }

  return dados;

}