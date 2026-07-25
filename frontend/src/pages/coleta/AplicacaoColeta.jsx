import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import CabecalhoColeta from "./components/CabecalhoColeta";

import FichaAvaliacao from "./components/FichaAvaliacao";

export default function AplicacaoColeta() {

  const navigate = useNavigate();

  // ======================================================
  // STATES
  // ======================================================

  const [coleta, setColeta] = useState(null);

  const [militares, setMilitares] = useState([]);

  const [avaliacoes, setAvaliacoes] = useState([]);

  const [busca, setBusca] = useState("");

  const [militarSelecionado, setMilitarSelecionado] = useState(null);

  const [estatisticas, setEstatisticas] = useState({

    totalMilitares: 0,

    totalAvaliados: 0,

    pendentes: 0

  });

  const [carregando, setCarregando] = useState(true);

  const inputBuscaRef = useRef(null);

  // ======================================================
  // CARREGAMENTO GERAL
  // ======================================================

  async function carregarDados() {

  setCarregando(true);

  try {

    const [

      coletaDB,

      militaresDB,

      avaliacoesDB,

      estatisticasDB

    ] = await Promise.all([

      obterColeta(),

      listarMilitares(),

      listarAvaliacoes(),

      contarAvaliacoes()

    ]);

    setColeta(coletaDB);

    setMilitares(militaresDB);

    setAvaliacoes(avaliacoesDB);

    setEstatisticas(estatisticasDB);

  }

  catch (erro) {

    console.error(erro);

    navigate("/coleta/importar");

  }

  finally {

    setCarregando(false);

  }

}

  useEffect(() => {

    carregarDados();

  }, []);

  // ======================================================
  // MAPA DE MILITARES AVALIADOS
  // ======================================================

  const mapaAvaliacoes = useMemo(() => {

    return new Set(

      avaliacoes.map(

        (avaliacao) => avaliacao.militarId

      )

    );

  }, [avaliacoes]);

  // ======================================================
  // PESQUISA LOCAL (EM MEMÓRIA)
  // ======================================================

  const militaresFiltrados = useMemo(() => {

    if (!busca.trim()) {

      return [];

    }

    const texto = busca.trim().toUpperCase();

    return militares

      .filter((militar) => {

        const nome = militar.nomeGuerra?.toUpperCase() || "";

        const nomeCompleto = militar.nomeCompleto?.toUpperCase() || "";

        return (

          nome.includes(texto) ||

          nomeCompleto.includes(texto)

        );

      })

      .map((militar) => ({

        ...militar,

        avaliado: mapaAvaliacoes.has(militar.id)

      }))

      .sort((a, b) => {

        if (a.avaliado !== b.avaliado) {

          return a.avaliado ? 1 : -1;

        }

        return a.nomeGuerra.localeCompare(

          b.nomeGuerra,

          "pt-BR"

        );

      });

  }, [

    busca,

    militares,

    mapaAvaliacoes

  ]);

  // ======================================================
  // ESTATÍSTICAS
  // ======================================================

  const progresso = useMemo(() => {

    if (!estatisticas.totalMilitares) {

      return 0;

    }

    return Math.round(

      (estatisticas.totalAvaliados /

        estatisticas.totalMilitares) *

        100

    );

  }, [estatisticas]);

  // ======================================================
  // FOCO AUTOMÁTICO
  // ======================================================

  useEffect(() => {

    if (!militarSelecionado) {

      inputBuscaRef.current?.focus();

    }

  }, [militarSelecionado]);

  // ======================================================
  // ENTER ABRE A FICHA
  // ======================================================

  function tratarTeclaBusca(event) {

    if (event.key !== "Enter") {

      return;

    }

    const pendentes = militaresFiltrados.filter(

      (militar) => !militar.avaliado

    );

    if (pendentes.length === 1) {

      setMilitarSelecionado(

        pendentes[0]

      );

    }

  }

  // ======================================================
  // APÓS SALVAR A FICHA
  // ======================================================

  async function finalizarAvaliacao() {

    setMilitarSelecionado(null);

    setBusca("");

    await carregarDados();

    requestAnimationFrame(() => {

      inputBuscaRef.current?.focus();

    });

  }

  // ======================================================
  // AGUARDANDO CARREGAMENTO
  // ======================================================

  if (carregando) {

    return (

      <div className="min-h-screen bg-green-900 flex items-center justify-center">

        <div className="bg-white rounded-3xl shadow-xl px-8 py-6">

          <p className="text-lg font-semibold text-green-900">

            Carregando coleta...

          </p>

        </div>

      </div>

    );

  }

  // ======================================================
  // NENHUMA COLETA IMPORTADA
  // ======================================================

  if (!coleta) {

    navigate("/coleta/importar");

    return null;

  }

  // ======================================================
  // FICHA DE AVALIAÇÃO
  // ======================================================

  if (militarSelecionado) {

    return (

      <div className="min-h-screen bg-green-900 flex justify-center p-4">

        <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">

          <CabecalhoColeta

            siglaOM={coleta.om?.sigla}

            subunidade={

              coleta.subunidade ??

              coleta.su

            }

          />

          <FichaAvaliacao

            militar={militarSelecionado}

            onVoltar={finalizarAvaliacao}

            onSalvou={finalizarAvaliacao}

          />

        </div>

      </div>

    );

  }

  // ======================================================
  // TELA PRINCIPAL
  // ======================================================

  return (

    <div className="min-h-screen bg-green-900 flex justify-center p-4">

      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">

        <CabecalhoColeta

          siglaOM={coleta.om?.sigla}

          subunidade={

            coleta.subunidade ??

            coleta.su

          }

        />

        <div className="space-y-5">

          <div className="rounded-xl bg-green-50 border border-green-300 p-4 space-y-2">

            <p className="font-bold text-green-800 text-lg">

              {coleta.om?.sigla}

            </p>

            <p className="text-sm">

              CODOM: {coleta.om?.codom}

            </p>

            <p className="text-sm">

              {coleta.campanha?.numeroTAF}º TAF • {coleta.campanha?.numeroChamada}ª Chamada

            </p>

            <div className="mt-4">

              <div className="flex justify-between text-sm font-semibold">

                <span>Progresso</span>

                <span>{progresso}%</span>

              </div>

              <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden mt-1">

                <div

                  className="h-full bg-green-700 transition-all"

                  style={{ width: `${progresso}%` }}

                />

              </div>

            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center">

              <div className="rounded-lg bg-white border p-2">

                <div className="text-xs text-gray-500">

                  Total

                </div>

                <div className="font-bold text-lg">

                  {estatisticas.totalMilitares}

                </div>

              </div>

              <div className="rounded-lg bg-green-100 border p-2">

                <div className="text-xs text-gray-600">

                  Avaliados

                </div>

                <div className="font-bold text-green-700 text-lg">

                  {estatisticas.totalAvaliados}

                </div>

              </div>

              <div className="rounded-lg bg-orange-100 border p-2">

                <div className="text-xs text-gray-600">

                  Pendentes

                </div>

                <div className="font-bold text-orange-700 text-lg">

                  {estatisticas.pendentes}

                </div>

              </div>

            </div>

          </div>

          <button

            onClick={() => navigate("/coleta/importar")}

            className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-xl py-3 font-semibold transition"

          >

            📥 Trocar Coleta

          </button>

          <div>

            <label className="block mb-2 font-semibold">

              Nome de Guerra

            </label>

            <input

              ref={inputBuscaRef}

              value={busca}

              onChange={(e) => setBusca(e.target.value)}

              onKeyDown={tratarTeclaBusca}

              placeholder="Digite o Nome de Guerra"

              className="border rounded-full px-5 py-3 w-full"

            />

          </div>

          <div className="border rounded-xl overflow-hidden max-h-[420px] overflow-y-auto">

            {

              militaresFiltrados.length === 0 && busca.trim() !== "" && (

                <div className="p-5 text-center text-gray-500">

                  Nenhum militar encontrado.

                </div>

              )

            }

            {

              militaresFiltrados.map((militar) => (

                <div

                  key={militar.id}

                  onClick={() => {

                    if (militar.avaliado) {

                      alert("Este militar já foi avaliado.");

                      return;

                    }

                    setMilitarSelecionado(militar);

                  }}

                  className={`

                    flex

                    justify-between

                    items-center

                    px-4

                    py-3

                    border-b

                    cursor-pointer

                    transition-colors

                    hover:bg-gray-100

                    ${

                      militar.avaliado

                        ? "bg-green-50"

                        : ""

                    }

                  `}

                >

                  <div>

                    <span className="font-bold">

                      {

                        militar.postoGraduacao?.abreviacao?.replace(

                          "§",

                          "º"

                        )

                      }

                    </span>

                    {" "}

                    {militar.nomeGuerra}

                  </div>

                  {

                    militar.avaliado && (

                      <span className="text-green-700 font-bold">

                        ✔

                      </span>

                    )

                  }

                </div>

              ))

            }

          </div>

          {

            estatisticas.pendentes === 0 &&

            estatisticas.totalMilitares > 0 && (

              <div className="rounded-xl bg-green-100 border border-green-400 p-4 text-center">

                <p className="font-bold text-green-800 mb-3">

                  Todos os militares foram avaliados.

                </p>

                <button

                  className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-3 font-semibold"

                >

                  📤 EXPORTAR COLETA

                </button>

              </div>

            )

          }

        </div>

      </div>

    </div>

  );

}