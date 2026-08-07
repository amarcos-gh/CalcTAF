import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {

  obterColeta,

  listarMilitares,

  listarAvaliacoes,

  contarAvaliacoes

} from "../../database/indexedDB";

import { STATUS_AVALIACAO } from "../../services/calculoTAF";

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

    navigate("/coleta/login");

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

      avaliacoes

        .filter(

          (avaliacao) =>

            avaliacao.status === STATUS_AVALIACAO.AVALIADO

        )

        .map(

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

  function sairAplicacao() {

    const confirmar = window.confirm(

      "Deseja encerrar esta sessão de avaliação?"

    );

    if (!confirmar) {

      return;

    }

    navigate("/coleta/login");

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

    navigate("/coleta/login");

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

            <p className="text-sm">

              {coleta.campanha?.numeroTAF}º TAF • {coleta.chamada?.numeroChamada}ª Chamada

            </p>

            <div className="mt-4">

            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">

              <div className="rounded-lg border bg-white py-1 text-center">
                <div className="text-[11px] text-gray-500">
                  Total
                </div>

                <div className="text-xl font-bold">
                  {estatisticas.totalMilitares}
                </div>
              </div>

              <div className="rounded-lg border bg-green-50 py-1 text-center">
                <div className="text-[11px] text-gray-500">
                  Avaliados
                </div>
                <div className="text-xl font-bold text-green-700">
                  {estatisticas.totalAvaliados}
                </div>
              </div>

              <div className="rounded-lg border bg-yellow-50 py-1 text-center">
                <div className="text-[11px] text-gray-500">
                  Pendentes
                </div>
                <div className="text-xl font-bold text-orange-600">
                  {estatisticas.pendentes}
                </div>
              </div>
              
              <div className="rounded-lg border bg-gray-100 py-1 text-center">
                <div className="text-[11px] text-gray-500">
                  Não Realizados
                </div>
                <div className="text-xl font-bold text-gray-700">
                  {estatisticas.naoRealizados}
                </div>
              </div>

            </div>

          </div>

          <div className="mt-2">

            <label className="block mb-1 font-semibold">

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

            {

              militaresFiltrados.length === 0 && busca.trim() !== "" && (

                <p className="mt-2 mb-2 text-center text-sm font-medium text-red-600">

                  Nenhum militar encontrado.

                </p>

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

          <div className=" mt-5 pt-1">

            <button

              type="button"

              onClick={sairAplicacao}

              className="
                w-full
                bg-gray-700
                hover:bg-gray-800
                text-white
                rounded-xl
                py-3
                font-semibold
                transition
              "

            >

              SAIR

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}