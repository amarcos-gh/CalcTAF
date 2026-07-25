import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";

export default function Coletas() {

  const location = useLocation();

  const abaInicial = location.state?.aba || "exportar";

  const [aba, setAba] = useState(abaInicial);

  const [numeroTAF, setNumeroTAF] = useState(1);

  const [numeroChamada, setNumeroChamada] = useState(1);

  const [pesquisa, setPesquisa] = useState("");

  const [militares, setMilitares] = useState([]);

  const [selecionados, setSelecionados] = useState([]);

  const [total, setTotal] = useState(0);

  const [avaliados, setAvaliados] = useState(0);

  const [carregando, setCarregando] = useState(false);

  // futuramente virá do login
  const omId = Number(localStorage.getItem("omId")) || 1;

  useEffect(() => {

    carregarMilitares();

  }, [numeroTAF, numeroChamada]);

  async function carregarMilitares() {

    try {

      setCarregando(true);

      const { data } = await api.get("/coleta/militares", {

        params: {

          omId,

          numeroTAF,

          numeroChamada,

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

  function selecionarTodos() {

    if (

      selecionados.length === militares.length

    ) {

      setSelecionados([]);

      return;

    }

    setSelecionados(

      militares.map(

        militar => militar.id

      )

    );

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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

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

          <div className="flex justify-between items-center mt-6">

            <div className="text-sm">

              <strong>Total:</strong> {total}

              <span className="mx-3">|</span>

              <strong>Avaliados:</strong> {avaliados}

              <span className="mx-3">|</span>

              <strong>Selecionados:</strong> {selecionados.length}

            </div>

            <button
              type="button"
              onClick={selecionarTodos}
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
            >
              {selecionados.length === militares.length &&
              militares.length > 0
                ? "Desmarcar Todos"
                : "Selecionar Todos"}
            </button>

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
                selecionados.length === 0 ||
                carregando
              }
              onClick={gerarColeta}
              className="
                bg-green-700
                hover:bg-green-800
                disabled:bg-gray-400
                disabled:cursor-not-allowed
                text-white
                px-8
                py-3
                rounded-xl
                font-semibold
                shadow
              "
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

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold text-green-800 mb-3">
            Histórico
          </h2>

          <p className="text-gray-600">
            Em breve será exibido o histórico das coletas realizadas.
          </p>

        </div>

      )}

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

            numeroChamada

          }

        }

      );

      const blob = new Blob(

        [

          JSON.stringify(

            data,

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

      alert("Coleta exportada com sucesso.");

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

      if (!arquivo) return;

      const texto = await arquivo.text();

      const dados = JSON.parse(texto);

      await api.post(

        "/coleta/importar",

        dados

      );

      alert("Avaliações importadas com sucesso.");

      event.target.value = "";

      carregarMilitares();

    }

    catch (erro) {

      console.error(erro);

      alert(

        erro.response?.data?.error ||

        "Erro ao importar avaliações."

      );

    }

  }

}