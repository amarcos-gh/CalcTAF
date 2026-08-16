import { useEffect, useMemo, useState } from "react";

import { useLocation } from "react-router-dom";

import api from "../../services/api";

import ModalCodigoColeta from "./components/ModalCodigoColeta";

export default function Coletas() {

  const location = useLocation();

  const abaInicial = location.state?.aba || "exportar";

  const [aba, setAba] = useState(abaInicial);

  const [numeroTAF, setNumeroTAF] = useState(1);

  const [numeroChamada, setNumeroChamada] = useState(1);

  const [subunidades, setSubunidades] = useState([]);

  const [subunidadeSelecionada, setSubunidadeSelecionada] = useState("");

  const [pesquisa, setPesquisa] = useState("");

  const [filtroSelecao, setFiltroSelecao] = useState("");

  const [militares, setMilitares] = useState([]);

  const [selecionados, setSelecionados] = useState([]);

  const [total, setTotal] = useState(0);

  const [avaliados, setAvaliados] = useState(0);

  const [carregando, setCarregando] = useState(false);

  const [modalCodigoAberto, setModalCodigoAberto] = useState(false);

  const [codigoAutenticacao, setCodigoAutenticacao] = useState("");

  const [historicoColetas, setHistoricoColetas] = useState([]);

  const [buscaHistorico, setBuscaHistorico] = useState("");

  const [paginaHistorico, setPaginaHistorico] = useState(1);

  const REGISTROS_HISTORICO_POR_PAGINA = 20;

  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  // futuramente virá do login
  const omId = Number(localStorage.getItem("omId")) || 1;

  useEffect(() => {

    carregarMilitares();

  }, [

    numeroTAF,

    numeroChamada,

    subunidadeSelecionada

  ]);

  useEffect(() => {

    if (Number(numeroChamada) === 1) {

      setFiltroSelecao("TODOS");

    }

    else if (Number(numeroChamada) === 2) {

      setFiltroSelecao("PENDENTES");

    }

  }, [

    numeroChamada

  ]);

  useEffect(() => {

    carregarSubunidades();

  }, [omId]);

  async function carregarMilitares() {

    try {

      setCarregando(true);

      const { data } = await api.get("/coleta/militares", {

        params: {

          omId,

          numeroTAF,

          numeroChamada,

          subunidadeId: subunidadeSelecionada,

          busca: pesquisa

        }

      });

      console.log(data.militares);

      setMilitares(data.militares || []);

      setTotal(data.total || 0);

      setAvaliados(data.avaliados || 0);

      setSelecionados([]);

    }

    catch (erro) {

      console.error(erro);

      alert("Erro ao carregar militares.");

    }

    finally {

      setCarregando(false);

    }

  }

  useEffect(() => {

    const timer = setTimeout(() => {

      carregarMilitares();

    }, 250);

    return () => clearTimeout(timer);

  }, [pesquisa]);

  // =====================================================
  // FILTRO DE SELEÇÃO
  // =====================================================

  useEffect(() => {

    if (!militares.length) {

      setSelecionados([]);

      return;

    }

    switch (filtroSelecao) {

      case "TODOS":

        setSelecionados(

          militares.map(

            (militar) => militar.id

          )

        );

        break;


      case "PENDENTES":

        setSelecionados(

          militares

            .filter(

              (militar) => !militar.avaliado

            )

            .map(

              (militar) => militar.id

            )

        );

        break;


      default:

        setSelecionados([]);

        break;

    }

  }, [

    filtroSelecao,

    militares

  ]);

  async function carregarSubunidades() {

    try {

      const { data } = await api.get("/subunidades", {

        params: {

          omId

        }

      });

      setSubunidades(data);

    }

    catch (erro) {

      console.error(erro);

      alert("Erro ao carregar Subunidades.");

    }

  }

  // =====================================================
  // CARREGAR HISTÓRICO DE COLETAS
  // =====================================================

  async function carregarHistoricoColetas() {

    try {

      setCarregandoHistorico(true);

      const { data } =
        await api.get(
          "/coleta/historico"
        );

      setHistoricoColetas(
        Array.isArray(data)
          ? data
          : []
      );

      setPaginaHistorico(1);

    }

    catch (erro) {

      console.error(
        "Erro ao carregar histórico de coletas:",
        erro
      );

      alert(
        erro.response?.data?.error ||
        "Erro ao buscar histórico de coletas."
      );

    }

    finally {

      setCarregandoHistorico(false);

    }

  }

  useEffect(() => {

    if (aba === "historico") {

      carregarHistoricoColetas();

    }

  }, [aba]);

  function selecionar(id) {

    if (selecionados.includes(id)) {

      setSelecionados(

        selecionados.filter(

          item => item !== id

        )

      );

    }

    else {

      setSelecionados([

        ...selecionados,

        id

      ]);

    }

  }  

  const militaresFiltrados = useMemo(() => {

    return militares;

  }, [militares]);

  function abreviarCurso(curso) {

    if (!curso) return "-";

    const nome = curso.nome ?? "";

    switch (nome) {

      case "Linha de Ensino Militar Bélico":
        return "LEMB";

      case "Linha de Ensino Militar de Saúde":
        return "LEMS/LEMC/LEMCT";

      default:
        return curso.abreviacao ??
              curso.sigla ??
              nome;
    }

  }

  useEffect(() => {

    setPaginaHistorico(1);

  }, [buscaHistorico]);  
  
   useEffect(() => {

    if (aba === "historico") {
      carregarHistoricoColetas();
    }

  }, [aba]);


  async function carregarHistoricoColetas() {

    try {

      setCarregandoHistorico(true);

      const { data } = await api.get(
        "/coleta/historico"
      );

      setHistoricoColetas(
        Array.isArray(data)
          ? data
          : []
      );

      setPaginaHistorico(1);

    }

    catch (erro) {

      console.error(
        "Erro ao carregar histórico de coletas:",
        erro
      );

      alert(
        erro.response?.data?.error ||
        "Erro ao buscar histórico de coletas."
      );

    }

    finally {

      setCarregandoHistorico(false);

    }

  }


  // =====================================================
  // HISTÓRICO FILTRADO
  // =====================================================

  const historicoFiltrado =
    useMemo(() => {

      const termo =
        buscaHistorico
          .trim()
          .toLowerCase();

      if (!termo) {

        return historicoColetas;

      }

      return historicoColetas.filter(
        (registro) => {

          const usuario =
            registro.usuario?.nome
              ?.toLowerCase() || "";

          const email =
            registro.usuario?.email
              ?.toLowerCase() || "";

          const arquivo =
            registro.arquivo
              ?.toLowerCase() || "";

          const tipo =
            registro.tipo
              ?.toLowerCase() || "";

          return (
            usuario.includes(termo) ||
            email.includes(termo) ||
            arquivo.includes(termo) ||
            tipo.includes(termo)
          );

        }
      );

    }, [
      historicoColetas,
      buscaHistorico
    ]);


  // =====================================================
  // PAGINAÇÃO DO HISTÓRICO
  // =====================================================

  const totalPaginasHistorico =
    Math.max(
      1,
      Math.ceil(
        historicoFiltrado.length /
          REGISTROS_HISTORICO_POR_PAGINA
      )
    );


  const indiceInicialHistorico =
    (paginaHistorico - 1) *
    REGISTROS_HISTORICO_POR_PAGINA;


  const indiceFinalHistorico =
    indiceInicialHistorico +
    REGISTROS_HISTORICO_POR_PAGINA;


  const historicoPagina =
    historicoFiltrado.slice(
      indiceInicialHistorico,
      indiceFinalHistorico
    );


  return (

    <div className="max-w-7xl mx-auto p-6">

      {/* ABAS */}

      <div className="flex gap-2 mb-6">

        <button
          type="button"
          onClick={() => setAba("exportar")}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            aba === "exportar"
              ? "bg-green-700 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Exportar
        </button>

        <button
          type="button"
          onClick={() => setAba("importar")}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            aba === "importar"
              ? "bg-green-700 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Importar
        </button>

        <button
          type="button"
          onClick={() => setAba("historico")}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            aba === "historico"
              ? "bg-green-700 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Histórico
        </button>

      </div>

      {/* EXPORTAR */}

      {aba === "exportar" && (

        <div className="bg-white rounded-xl shadow p-6">

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

            <div>

              <label className="block font-semibold mb-1">
                TAF
              </label>

              <select
                className="w-full border rounded-lg p-2"
                value={numeroTAF}
                onChange={(e) =>
                  setNumeroTAF(Number(e.target.value))
                }
              >
                <option value={1}>1º TAF</option>
                <option value={2}>2º TAF</option>
                <option value={3}>3º TAF</option>
              </select>

            </div>

            <div>

              <label className="block font-semibold mb-1">
                Chamada
              </label>

              <select
                className="w-full border rounded-lg p-2"
                value={numeroChamada}
                onChange={(e) =>
                  setNumeroChamada(Number(e.target.value))
                }
              >
                <option value={1}>1ª Chamada</option>
                <option value={2}>2ª Chamada</option>
              </select>

            </div>

            <div>

  <label className="block font-semibold mb-1">

    Subunidade

  </label>

  <select

    className="w-full border rounded-lg p-2"

    value={subunidadeSelecionada}

    onChange={(e) =>

      setSubunidadeSelecionada(e.target.value)

    }

  >

    <option value="">

      Todas

    </option>

    {subunidades.map((sub) => (

      <option

        key={sub.id}

        value={sub.id}

      >

        {sub.nome}

      </option>

    ))}

  </select>

</div>

            <div className="md:col-span-2">

              <label className="block font-semibold mb-1">
                Pesquisar Militar
              </label>

              <input
                className="w-full border rounded-lg p-2"
                placeholder="Digite pelo menos 3 letras..."
                value={pesquisa}
                onChange={(e) =>
                  setPesquisa(e.target.value)
                }
              />

            </div>

          </div>

          <div className="mt-5 grid grid-cols-4 gap-3">

            <label className="flex items-center gap-2 cursor-pointer col-span-2">

              <input
                type="radio"
                name="filtroSelecao"
                checked={filtroSelecao === "TODOS"}
                onChange={() => setFiltroSelecao("TODOS")}
              />

              <span>

                Todos os militares

              </span>

            </label>

            <label className="flex items-center gap-2 cursor-pointer col-span-2">

              <input
                type="radio"
                name="filtroSelecao"
                checked={filtroSelecao === "PENDENTES"}
                onChange={() => setFiltroSelecao("PENDENTES")}
              />

              <span>

                Pendentes / Não Realizados

              </span>

            </label>

          </div>

          <div className="flex justify-between items-center mt-4">

            <div className="text-sm">

              <strong>Total:</strong> {total}

              <span className="mx-3">|</span>

              <strong>Avaliados:</strong> {avaliados}

              <span className="mx-3">|</span>

              <strong>Selecionados:</strong> {selecionados.length}

            </div>

          </div>

          <div className="overflow-x-auto mt-5">

            <table className="min-w-full border border-gray-300">

              <thead className="bg-green-700 text-white">

                <tr>

                  <th className="p-2 w-10"></th>

                  <th className="p-2 text-left">
                    Nome de Guerra
                  </th>

                  <th className="p-2">
                    Posto/Graduação
                  </th>

                  <th className="p-2">
                    Sexo
                  </th>

                  <th className="p-2">
                    Idade
                  </th>

                  <th className="p-2">
                    Curso
                  </th>

                </tr>

              </thead>

              <tbody>

              {carregando && (

                <tr>

                  <td
                    colSpan={6}
                    className="text-center py-8"
                  >
                    Carregando militares...
                  </td>

                </tr>

              )}

              {!carregando &&
                militares.length === 0 && (

                  <tr>

                    <td
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      Nenhum militar encontrado.
                    </td>

                  </tr>

              )}

              {!carregando &&
                militaresFiltrados.map((militar) => {

                  const marcado =
                    selecionados.includes(
                      militar.id
                    );

                  return (

                    <tr
                      key={militar.id}
                      className="border-t hover:bg-green-50"
                    >

                      <td className="text-center">

                        <input
                          type="checkbox"
                          checked={marcado}
                          onChange={() =>
                            selecionar(
                              militar.id
                            )
                          }
                        />

                      </td>

                      <td className="p-2">
                        <strong>
                          {militar.nomeGuerra}
                        </strong>
                      </td>

                      <td className="p-2 text-center">
                        {militar.postoGraduacao?.abreviacao ??
                          militar.postoGraduacao}
                      </td>

                      <td className="p-2 text-center">
                        {militar.segmento}
                      </td>

                      <td className="p-2 text-center">
                        {militar.idade}
                      </td>

                      <td className="p-2 text-center">
                        {abreviarCurso(militar.curso)}
                      </td>

                    </tr>

                  );

              })}

              </tbody>

            </table>

          </div>

          <div className="flex justify-end mt-6">

            <button
              type="button"
              disabled={
                carregando ||
                selecionados.length === 0
              }
              onClick={gerarColeta}
              className={`
                text-white
                px-8
                py-3
                rounded-xl
                font-semibold
                shadow
                transition
                ${
                  carregando || selecionados.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                }
              `}
            >
              📥 Gerar Coleta (.ctaf)
            </button>

          </div>

        </div>

      )}

      {/* =========================
          IMPORTAR
      ========================== */}

      {aba === "importar" && (

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold text-green-800 mb-3">
            Importar Avaliações
          </h2>

          <p className="text-gray-600 mb-6">
            Selecione o arquivo exportado pelo CalcTAF Campo.
          </p>

          <input
            type="file"
            accept=".ctaf"
            onChange={importarAvaliacoes}
            className="
              block
              w-full
              border
              rounded-lg
              p-3
            "
          />

        </div>

      )}

      {/* =========================
          HISTÓRICO
      ========================== */}

      {aba === "historico" && (

        <div className="bg-white rounded-2xl shadow-lg p-4">

          {/* =================================================
              CABEÇALHO
          ================================================= */}

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-base font-bold text-slate-800">
              Registros
            </h2>

            <div className="flex items-center gap-2">

              <input
                type="text"
                placeholder="Pesquisar..."
                value={buscaHistorico}
                onChange={(e) => {
                  setBuscaHistorico(e.target.value);
                  setPaginaHistorico(1);
                }}
                className="
                  w-52
                  border
                  border-gray-700
                  rounded-lg
                  px-3
                  py-1.5
                  text-xs
                  focus:outline-none
                  focus:ring-1
                  focus:ring-green-700
                "
              />

              <button
                type="button"
                onClick={carregarHistoricoColetas}
                disabled={carregandoHistorico}
                className="
                  px-3
                  py-1.5
                  rounded-lg
                  bg-green-700
                  text-white
                  text-xs
                  font-semibold
                  hover:bg-green-800
                  disabled:opacity-50
                "
              >
                {carregandoHistorico
                  ? "Atualizando..."
                  : "Atualizar"}
              </button>

            </div>

          </div>


          {/* =================================================
              CARREGANDO
          ================================================= */}

          {carregandoHistorico ? (

            <div className="text-center py-8 text-xs text-gray-500">
              Carregando histórico...
            </div>

          ) : historicoColetas.length === 0 ? (

            <div className="text-center py-8 text-xs text-gray-500">
              Nenhum registro de exportação ou importação encontrado.
            </div>

          ) : (

            <>

              {/* =================================================
                  TABELA
              ================================================= */}

              <div className="overflow-x-auto">

                <table className="w-full text-xs">

                  <thead>

                    <tr className="bg-green-700 text-white">

                      <th className="px-2 py-1.5 text-left">
                        Ação
                      </th>

                      <th className="px-2 py-1.5 text-left">
                        Arquivo
                      </th>

                      <th className="px-2 py-1.5 text-center">
                        Quantidade
                      </th>

                      <th className="px-2 py-1.5 text-left">
                        Data/Hora
                      </th>

                      <th className="px-2 py-1.5 text-left">
                        Usuário
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {historicoPagina.length === 0 ? (

                      <tr>

                        <td
                          colSpan="5"
                          className="
                            text-center
                            py-6
                            text-xs
                            text-gray-500
                          "
                        >
                          Nenhum registro encontrado.
                        </td>

                      </tr>

                    ) : (

                      historicoPagina.map(
                        (registro) => (

                          <tr
                            key={registro.id}
                            className="
                              border-b
                              border-gray-300
                              hover:bg-gray-50
                            "
                          >

                            <td className="px-2 py-1">

                              {registro.tipo ===
                              "EXPORTACAO"
                                ? "Exportação"
                                : registro.tipo ===
                                  "IMPORTACAO"
                                ? "Importação"
                                : registro.tipo}

                            </td>


                            <td
                              className="
                                px-2
                                py-1
                                font-medium
                              "
                            >

                              {registro.arquivo || "-"}

                            </td>


                            <td
                              className="
                                px-2
                                py-1
                                text-center
                              "
                            >

                              {registro.quantidade ?? "-"}

                            </td>


                            <td
                              className="
                                px-2
                                py-1
                                whitespace-nowrap
                              "
                            >

                              {registro.createdAt
                                ? new Date(
                                    registro.createdAt
                                  ).toLocaleString(
                                    "pt-BR"
                                  )
                                : "-"}

                            </td>


                            <td className="px-2 py-1">

                              {registro.usuario?.nome ||
                                registro.usuario?.email ||
                                "-"}

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>


              {/* =================================================
                  PAGINAÇÃO
              ================================================= */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mt-3
                  text-xs
                "
              >

                <button
                  type="button"
                  disabled={
                    paginaHistorico <= 1 ||
                    carregandoHistorico
                  }
                  onClick={() =>
                    setPaginaHistorico(
                      paginaHistorico - 1
                    )
                  }
                  className="
                    px-3
                    py-1.5
                    rounded-lg
                    bg-slate-100
                    text-slate-600
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    hover:bg-slate-200
                  "
                >
                  ← Anterior
                </button>


                <span className="text-slate-600">

                  Página{" "}
                  <strong>
                    {paginaHistorico}
                  </strong>{" "}
                  de{" "}
                  <strong>
                    {Math.max(
                      1,
                      Math.ceil(
                        historicoColetas.length /
                          REGISTROS_HISTORICO_POR_PAGINA
                      )
                    )}
                  </strong>

                </span>


                <button
                  type="button"
                  disabled={
                    paginaHistorico >=
                      Math.max(
                        1,
                        Math.ceil(
                          historicoColetas.length /
                            REGISTROS_HISTORICO_POR_PAGINA
                        )
                      ) ||
                    carregandoHistorico
                  }
                  onClick={() =>
                    setPaginaHistorico(
                      paginaHistorico + 1
                    )
                  }
                  className="
                    px-3
                    py-1.5
                    rounded-lg
                    bg-slate-100
                    text-slate-600
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    hover:bg-slate-200
                  "
                >
                  Próxima →
                </button>

              </div>

            </>

          )}

        </div>

      )}

      <ModalCodigoColeta

        aberto={modalCodigoAberto}

        codigo={codigoAutenticacao}

        onFechar={() => {

          setModalCodigoAberto(false);

          setCodigoAutenticacao("");

        }}

      />

    </div>

  );

  // ==========================================
  // GERAÇÃO DA COLETA
  // ==========================================

  async function gerarColeta() {

    try {

      setCarregando(true);

      const { data } = await api.get(

      "/coleta/exportar",

      {

        params: {

          omId,

          numeroTAF,

          numeroChamada,

          subunidadeId: subunidadeSelecionada,

          militares: selecionados.join(",")

        }

      }

    );

      const blob = new Blob(

        [

          JSON.stringify(

            data.coleta,

            null,

            2

          )

        ],

        {

          type: "application/json"

        }

      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download =
        `Coleta_${numeroTAF}TAF_${numeroChamada}Chamada.ctaf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setCodigoAutenticacao(

        data.codigoAutenticacao

      );

      setModalCodigoAberto(true);

    }

    catch (erro) {

      console.error(erro);

      alert("Erro ao gerar a coleta.");

    }

    finally {

      setCarregando(false);

    }

  }

  // ==========================================
  // IMPORTAÇÃO DAS AVALIAÇÕES
  // ==========================================

  async function importarAvaliacoes(event) {

    try {

      const arquivo = event.target.files?.[0];

      if (!arquivo) {

        return;

      }

      // ==========================================
      // VALIDA EXTENSÃO
      // ==========================================

      if (

        !arquivo.name.toLowerCase().endsWith(".ctaf")

      ) {

        throw new Error(

          "Selecione um arquivo .ctaf."

        );

      }

      const texto = await arquivo.text();

      const dados = JSON.parse(texto);

      // ==========================================
      // VALIDA TIPO
      // ==========================================

      if (

        dados.tipo !== "RESULTADO_AVALIACAO"

      ) {

        throw new Error(

          "O arquivo selecionado não é um Resultado de Avaliação."

        );

      }

      // ==========================================
      // VALIDA VERSÃO
      // ==========================================

      if (

        dados.versao !== "1.0"

      ) {

        throw new Error(

          "Versão do arquivo incompatível."

        );

      }

      // ==========================================
      // VALIDA AVALIAÇÕES
      // ==========================================

      if (

        !Array.isArray(dados.avaliacoes) ||

        dados.avaliacoes.length === 0

      ) {

        throw new Error(

          "O arquivo não possui avaliações."

        );

      }

      // ==========================================
      // ENVIA AO BACKEND
      // ==========================================

      await api.post(

        "/coleta/importar",

        dados

      );

      alert(

        `${dados.avaliacoes.length} avaliações importadas com sucesso.`

      );

      event.target.value = "";

      carregarMilitares();

    }

    catch (erro) {

      console.error(erro);

      alert(

        erro.response?.data?.error ||

        erro.message ||

        "Erro ao importar avaliações."

      );

    }

  }

}