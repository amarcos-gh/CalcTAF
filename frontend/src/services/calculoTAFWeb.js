import api from "./api";

export async function processarAvaliacao(dados) {

  const response = await api.post(
    "/avaliacoes/calcular",
    dados
  );

  return response.data;

}