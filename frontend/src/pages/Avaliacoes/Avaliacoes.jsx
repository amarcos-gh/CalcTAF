import { useEffect, useState, useRef } from "react";

import api from "../../services/api";

import mencaoColor from "../../utils/mencaoColor";

import { processarAvaliacao } from "../../services/calculoTAFWeb";

export default function Avaliacoes() {

  const [militares, setMilitares] = useState([]);

  const [avaliacoes, setAvaliacoes] = useState([]);

  const [historico, setHistorico] = useState([]);

  const [campanhas, setCampanhas] = useState([]);

  const [mensagem, setMensagem] = useState("");

  const [busca, setBusca] = useState("");

  const [buscaMilitar, setBuscaMilitar] = useState("");

  const [militarSelecionado, setMilitarSelecionado] = useState(null);

  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);

  const [bloquearLancamento, setBloquearLancamento] = useState(false);

  const [militarBloqueado, setMilitarBloqueado] = useState(false);

  const [resultadoTempoReal, setResultadoTempoReal] = useState({

    mencaoCorrida: "--",

    mencaoFlexao: "--",

    mencaoAbdominal: "--",

    mencaoBarra: "--",

    mencaoPPM: "--",

    mencaoFinal: "--"

  });

  const [manterPeriodo, setManterPeriodo] = useState(false);

  const [form, setForm] = useState({

    militarId: "",

    campanhaId: "",
    chamadaId: "",

    periodoInicio: "",
    periodoFim: "",

    corrida: "",
    flexao: "",
    abdominal: "",
    barra: "",

    ppm: ""
  });

  const [abaAtiva, setAbaAtiva] = useState("lancamento");

  useEffect(() => {

  }, [mensagem]);

  function mostrarMensagem(texto) {

  setMensagem(texto);

    /*setTimeout(() => {

      setMensagem("");

    }, 3000);*/

  }

  const corridaRef = useRef(null);

  const flexaoRef = useRef(null);

  const abdominalRef = useRef(null);

  const barraRef = useRef(null);

  const ppmRef = useRef(null);

  const salvarRef = useRef(null);

  const cursoEspecial =

    ["LEMS", "LEMC", "LEMCT"]

      .includes(

        militarSelecionado?.curso?.codigo
      );

  let idadeMilitar = 0;

  if (militarSelecionado) {

    const hoje = new Date();

    const nascimento = new Date(

      militarSelecionado.dataNascimento

    );

    idadeMilitar =

      hoje.getFullYear() -

      nascimento.getFullYear();

    const diferencaMes =

      hoje.getMonth() -

      nascimento.getMonth();

    if (

      diferencaMes < 0 ||

      (

        diferencaMes === 0 &&

        hoje.getDate() < nascimento.getDate()

      )

    ) {

      idadeMilitar--;

    }

  }

  const militar50Mais =

    idadeMilitar >= 50;

  const dispensaBarra =

  cursoEspecial

  ||

  idadeMilitar >= 50;

  const dispensaPPM =

  cursoEspecial

  ||

  idadeMilitar >= 40;

    useEffect(() => {

      async function atualizarResultado() {

        if (!militarSelecionado) {

          setResultadoTempoReal({

            mencaoCorrida: "--",

            mencaoFlexao: "--",

            mencaoAbdominal: "--",

            mencaoBarra: "--",

            mencaoPPM: "--",

            mencaoFinal: "--"

          });

          return;

        }

        const resultado = await processarAvaliacao({

          militarId: militarSelecionado.id,

          omId: Number(localStorage.getItem("omId")),

          corrida:

            form.corrida === ""

              ? null

              : Number(form.corrida),

          flexao:

            form.flexao === ""

              ? null

              : Number(form.flexao),

          abdominal:

            form.abdominal === ""

              ? null

              : Number(form.abdominal),

          barra:

            form.barra === ""

              ? null

              : Number(form.barra),

          ppm:

            dispensaPPM

              ? null

              : form.ppm

        });

        setResultadoTempoReal(resultado);

      }

      atualizarResultado();

    }, [

      militarSelecionado,

      idadeMilitar,

      form.corrida,

      form.flexao,

      form.abdominal,

      form.barra,

      form.ppm

    ]);

    async function carregarMilitares() {

    try {

      const response = await api.get(

        "/militares",

        {
          params: {
            omId: localStorage.getItem("omId")
          }
        }

      );

      console.dir(

        response.data[0],

        {

          depth: null

        }

      );

      setMilitares(response.data);

    } catch (error) {

      console.error(error);

    }

  }

  async function carregarAvaliacoes() {

    try {

      const response =

    await api.get(

    `/avaliacoes?omId=${

    localStorage.getItem(

    "omId"

    )

  }`
);

console.table(

  response.data.map(

    (a) => ({

      id:
        a.id,

      militar:
        a.militar
          ?.nomeGuerra,

      militarId:
        a.militarId,

      chamada:
        a.chamadaId,

      mencao:
        a.mencaoFinal
    })
  )
);

const unicas =

  Object.values(

    response.data.reduce(

      (

        acc,

        atual

      ) => {

        const chave =

          `${

            atual.militarId

          }-${

            atual.chamada?.campanhaId

          }`;

        if (

          !acc[chave]

          ||

          atual.id >

          acc[chave].id

        ) {

          acc[chave] =

            atual;
        }

        return acc;

      },

      {}
    )
  );

setAvaliacoes(

  unicas
);

    } catch (error) {

      console.error(error);
    }
  }

  async function carregarHistorico() {

    try {

      const response = await api.get(

        `/avaliacoes/logs?omId=${

          localStorage.getItem(

            "omId"

          )

        }`

      );

      setHistorico(

        response.data

      );

    } catch (error) {

      console.error(error);

    }

  }

  async function selecionarMilitar(militar) {

    setMilitarSelecionado(militar);

    setBuscaMilitar(
      `${militar.postoGraduacao?.abreviacao || ""} ${militar.nomeGuerra} - ${militar.nomeCompleto}`
    );

    // =====================================================
    // CHAMADA SELECIONADA
    // =====================================================

    const chamadaSelecionada = campanhas
      .find((c) => c.id === Number(form.campanhaId))
      ?.chamadas
      ?.find((c) => c.id === Number(form.chamadaId));

    const numeroChamada =
      chamadaSelecionada?.numeroChamada;

    const avaliacaoPrimeiraChamada =
      militar.avaliacaoPrimeiraChamada;

    // ================================================
    // BLOQUEIO PARA 2ª CHAMADA
    // ================================================

    if (

      numeroChamada === 2 &&

      avaliacaoPrimeiraChamada &&

      avaliacaoPrimeiraChamada.mencaoFinal !== "NR"

    ) {

      setMilitarBloqueado(true);

    }

    else {

      setMilitarBloqueado(false);

    }

    if (

      numeroChamada === 2 &&

      avaliacaoPrimeiraChamada &&

      avaliacaoPrimeiraChamada.mencaoFinal !== "NR"

    ) {

      mostrarMensagem(

        "Militar já avaliado na 1ª Chamada."

      );

      setAvaliacaoSelecionada(null);

      setForm((anterior) => ({

        ...anterior,

        militarId: militar.id,

        corrida: "",

        flexao: "",

        abdominal: "",

        barra: "",

        ppm: ""

      }));

      setTimeout(() => {

        corridaRef.current?.focus();

      }, 50);

      return;

    }

    // =====================================================
    // AVALIAÇÃO DA CHAMADA ATUAL
    // =====================================================

    const avaliacaoExistente = avaliacoes.find((a) => {

      return (

        a.militarId === militar.id &&

        a.chamadaId === Number(form.chamadaId)

      );

    });

    if (
        avaliacaoExistente &&
        avaliacaoExistente.mencaoFinal &&
        avaliacaoExistente.mencaoFinal !== "NR"
      ) {

      mostrarMensagem("Militar já avaliado nesta chamada.");

      setAvaliacaoSelecionada(avaliacaoExistente);

      setForm((anterior) => ({

        ...anterior,

        militarId: militar.id,

        corrida:
          avaliacaoExistente.corrida == null
            ? ""
            : String(avaliacaoExistente.corrida),

        flexao:
          avaliacaoExistente.flexao == null
            ? ""
            : String(avaliacaoExistente.flexao),

        abdominal:
          avaliacaoExistente.abdominal == null
            ? ""
            : String(avaliacaoExistente.abdominal),

        barra:
          avaliacaoExistente.barra == null
            ? ""
            : String(avaliacaoExistente.barra),

        ppm:
          avaliacaoExistente.ppm ?? ""

      }));

    }

    else {

    if (avaliacaoExistente) {

      // =====================================================
      // EXISTE REGISTRO, MAS A MENÇÃO FINAL É NR
      // O militar ainda não foi avaliado.
      // Mantemos o registro para que o salvamento faça PUT
      // e não crie uma avaliação duplicada.
      // =====================================================

      mostrarMensagem(
        "Militar sem avaliação para esta chamada."
      );

      setAvaliacaoSelecionada(avaliacaoExistente);

      setForm((anterior) => ({

        ...anterior,

        militarId: militar.id,

        corrida: "",

        flexao: "",

        abdominal: "",

        barra: "",

        ppm: ""

      }));

    }

    else {

      // =====================================================
      // NÃO EXISTE REGISTRO PARA ESTA CHAMADA
      // O salvamento deverá criar uma nova avaliação.
      // =====================================================

      mostrarMensagem(
        "Militar sem avaliação para esta chamada."
      );

      setAvaliacaoSelecionada(null);

      setForm((anterior) => ({

        ...anterior,

        militarId: militar.id,

        corrida: "",

        flexao: "",

        abdominal: "",

        barra: "",

        ppm: ""

      }));

    }

  }

  setTimeout(() => {

    corridaRef.current?.focus();

  }, 50);

  }

  async function carregarCampanhas() {

    try {

      const response =
        await api.get("/campanhas");

      setCampanhas(response.data);

    } catch (error) {

      console.error(error);
    }
  }

  async function cadastrarAvaliacao(e) {

    e.preventDefault();

    // ===========================================
    // VALIDAÇÕES
    // ===========================================

    if (!form.campanhaId) {

      mostrarMensagem("Selecione o TAF.");

      return;

    }

    if (!form.chamadaId) {

      mostrarMensagem("Selecione a Chamada.");

      return;

    }

    if (!form.militarId) {

      mostrarMensagem("Selecione um militar.");

      return;

    }

    if (
        avaliacaoSelecionada &&
        avaliacaoSelecionada.mencaoFinal !== "NR"
      ) {

        const confirmar = window.confirm(

          "Este militar já possui avaliação nesta chamada.\n\nDeseja atualizá-la?"

        );

        if (!confirmar) {

          return;

        }

      }

      if (avaliacaoSelecionada) {

        try {

        const response = await api.put(

          `/avaliacoes/${avaliacaoSelecionada.id}`,

          {

            corrida:
              form.corrida === ""
                ? null
                : Number(form.corrida),

            flexao:
              form.flexao === ""
                ? null
                : Number(form.flexao),

            abdominal:
              form.abdominal === ""
                ? null
                : Number(form.abdominal),

            barra:
              form.barra === ""
                ? null
                : Number(form.barra),

            ppm:
              form.ppm === ""
                ? null
                : form.ppm,

            periodoInicio: form.periodoInicio,

            periodoFim: form.periodoFim

          }

        );

        setAvaliacaoSelecionada(response.data);

        await carregarAvaliacoes();

        mostrarMensagem(
          "Avaliação atualizada com sucesso."
        );

      } catch (error) {

        console.error(error);

        mostrarMensagem(
          "Não foi possível salvar a avaliação."
        );

      }

      return;

    }

    try {

      const response = await api.post(

        "/avaliacoes",

        {
            militarId: Number(form.militarId),

            chamadaId: Number(form.chamadaId),

            corrida:
                form.corrida === ""
                    ? null
                    : Number(form.corrida),

            flexao:
                form.flexao === ""
                    ? null
                    : Number(form.flexao),

            abdominal:
                form.abdominal === ""
                    ? null
                    : Number(form.abdominal),

            barra:
                form.barra === ""
                    ? null
                    : Number(form.barra),

            ppm:
                form.ppm === ""
                    ? null
                    : form.ppm,

            periodoInicio: form.periodoInicio,

            periodoFim: form.periodoFim,

            omId: Number(localStorage.getItem("omId"))

        }

    );

setForm({

    militarId: "",

    periodoInicio:
        manterPeriodo
            ? form.periodoInicio
            : "",

    periodoFim:
        manterPeriodo
            ? form.periodoFim
            : "",

    campanhaId:
        manterPeriodo
            ? form.campanhaId
            : "",

    chamadaId:
        manterPeriodo
            ? form.chamadaId
            : "",

    corrida: "",

    flexao: "",

    abdominal: "",

    barra: "",

    ppm: ""

});

setBuscaMilitar("");

setMilitarSelecionado(null);

setAvaliacaoSelecionada(response.data);

await carregarAvaliacoes();

mostrarMensagem("Avaliação cadastrada com sucesso.");

    
   } catch (error) {

    console.error(error);

    if (error.response?.status === 409) {

      const avaliacaoExistente =
        error.response.data.avaliacao;

      setAvaliacaoSelecionada({

        ...avaliacaoExistente,

        corrida:
          form.corrida || avaliacaoExistente.corrida,

        flexao:
          form.flexao || avaliacaoExistente.flexao,

        abdominal:
          form.abdominal || avaliacaoExistente.abdominal,

        barra:
          dispensaBarra
            ? ""
            : (form.barra || avaliacaoExistente.barra),

        ppm:
          dispensaPPM
            ? ""
            : (form.ppm || avaliacaoExistente.ppm)

      });

      try {

        const response = await api.put(

          `/avaliacoes/${avaliacaoExistente.id}`,

          {

            corrida:
              form.corrida !== ""
                ? Number(form.corrida)
                : avaliacaoExistente.corrida,

            flexao:
              form.flexao !== ""
                ? Number(form.flexao)
                : avaliacaoExistente.flexao,

            abdominal:
              form.abdominal !== ""
                ? Number(form.abdominal)
                : avaliacaoExistente.abdominal,

            barra:
              form.barra !== ""
                ? Number(form.barra)
                : avaliacaoExistente.barra,

            ppm:
              form.ppm !== ""
                ? form.ppm
                : avaliacaoExistente.ppm,

            periodoInicio:
              form.periodoInicio,

            periodoFim:
              form.periodoFim

          }

        );

        setAvaliacaoSelecionada(response.data);

        await carregarAvaliacoes();

        mostrarMensagem(
          "Avaliação atualizada com sucesso."
        );

      } catch (erroAtualizacao) {

        console.error(erroAtualizacao);

        mostrarMensagem(
          "Não foi possível salvar a avaliação."
        );

      }

      return;

    } else {

      mostrarMensagem(
        "Não foi possível salvar a avaliação."
      );

      }

    } // fecha o catch

  } // fecha cadastrarAvaliacao

  useEffect(() => {

    carregarMilitares();

    carregarAvaliacoes();

    carregarHistorico();

    carregarCampanhas();

  }, []);

  useEffect(() => {

    return () => {

      setManterPeriodo(
        false
      );
    };

  }, []);

  const avaliacoesFiltradas =
    avaliacoes.filter((avaliacao) => {

      if (!busca.trim()) {
        return true;
      }

      const termo =
        busca.toLowerCase();

      const nomeGuerra =
        avaliacao.militar?.nomeGuerra
          ?.toLowerCase() || "";

      const nomeCompleto =
        avaliacao.militar?.nomeCompleto
          ?.toLowerCase() || "";

      return (
        nomeGuerra.includes(termo) ||
        nomeCompleto.includes(termo)
      );
    });

  const militaresFiltrados =
    militares.filter((militar) => {

      if (!buscaMilitar.trim()) {
        return false;
      }

      const termo =
        buscaMilitar.toLowerCase();

      const nomeGuerra =
        militar.nomeGuerra
          ?.toLowerCase() || "";

      const nomeCompleto =
        militar.nomeCompleto
          ?.toLowerCase() || "";

      return (
        nomeGuerra.includes(termo) ||
        nomeCompleto.includes(termo)
      );
    });

return (

    <div className="space-y-6">

      {/* ABAS */}

      <div className="bg-white rounded-2xl shadow-lg p-3">

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() => setAbaAtiva("lancamento")}
            className={`
              px-6
              py-3
              rounded-xl
              font-semibold
              transition-all
              ${
                abaAtiva === "lancamento"

                  ? "bg-green-700 text-white"

                  : "bg-slate-200 text-black hover:bg-slate-300"
              }
            `}
          >
            Lançamento
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva("historico")}
            className={`
              px-6
              py-3
              rounded-xl
              font-semibold
              transition-all
              ${
                abaAtiva === "historico"

                  ? "bg-green-700 text-white"

                  : "bg-slate-200 text-black hover:bg-slate-300"
              }
            `}
          >
            Histórico
          </button>

        </div>

      </div>

      {/* ABA LANÇAMENTO */}

      {abaAtiva === "lancamento" && (

      <form
          onSubmit={cadastrarAvaliacao}
          className="space-y-6"
      >

          {mensagem && (

            <div
              className={`rounded-xl border px-4 py-3 font-semibold ${
                mensagem.toLowerCase().includes("erro")
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "bg-green-50 border-green-300 text-green-700"
              }`}
            >
              {mensagem}
            </div>

          )}

          {/* ============================
              DADOS DA AVALIAÇÃO
          ============================ */}

          <div className="bg-white rounded-2xl shadow-lg p-6">

              <h2 className="text-xl font-bold text-slate-800 mb-6">
                  Dados da Avaliação
              </h2>

              <div className="grid grid-cols-12 gap-5">

                  {/* PERÍODO INICIAL */}

                  <div className="col-span-12 md:col-span-3">

                      <label className="block mb-1 font-medium">

                          Período Inicial

                      </label>

                      <input
                          type="date"
                          value={form.periodoInicio}
                          onChange={(e)=>

                              setForm({

                                  ...form,

                                  periodoInicio:e.target.value

                              })

                          }
                          className="w-full rounded-lg border px-3 py-2"
                      />

                  </div>

                  {/* PERÍODO FINAL */}

                  <div className="col-span-12 md:col-span-3">

                      <label className="block mb-1 font-medium">

                          Período Final

                      </label>

                      <input
                          type="date"
                          value={form.periodoFim}
                          onChange={(e)=>

                              setForm({

                                  ...form,

                                  periodoFim:e.target.value

                              })

                          }
                          className="w-full rounded-lg border px-3 py-2"
                      />

                  </div>

                  {/* TAF */}

                  <div className="col-span-12 md:col-span-2">

                      <label className="block mb-1 font-medium">

                          TAF

                      </label>

                      <select

                          value={form.campanhaId}

                          onChange={(e)=>

                              setForm({

                                  ...form,

                                  campanhaId:e.target.value

                              })

                          }

                          className="w-full rounded-lg border px-3 py-2"

                      >

                          <option value="">
                              Selecione
                          </option>

                          {campanhas.map((campanha) => (

                              <option
                                  key={campanha.id}
                                  value={campanha.id}
                              >
                                  {campanha.numeroTAF}º TAF ({campanha.ano})
                              </option>

                          ))}

                      </select>

                  </div>

                  {/* CHAMADA */}

                  <div className="col-span-12 md:col-span-2">

                      <label className="block mb-1 font-medium">

                          Chamada

                      </label>

                      <select

                      value={form.chamadaId}

                      onChange={(e)=>

                          setForm({

                              ...form,

                              chamadaId: e.target.value

                          })

                      }

                      className="w-full rounded-lg border px-3 py-2"

                  >

                      <option value="">
                          Selecione
                      </option>

                      {campanhas
                        .find(c => c.id === Number(form.campanhaId))
                        ?.chamadas
                        ?.map((chamada) => (

                          <option
                              key={chamada.id}
                              value={chamada.id}
                          >
                              {chamada.numeroChamada}ª Chamada
                          </option>

                      ))}

                  </select>

                  </div>

                  {/* MANTER PERÍODO */}

                  <div className="col-span-12 md:col-span-2 flex items-end">

                      <label className="flex items-center gap-2">

                          <input

                              type="checkbox"

                              checked={manterPeriodo}

                              onChange={(e)=>

                                  setManterPeriodo(

                                      e.target.checked

                                  )

                              }

                          />

                          Manter período

                      </label>

                  </div>

                  {/* BUSCAR MILITAR */}

                  <div className="col-span-12 relative">

                      <label className="block mb-1 font-medium">

                          Buscar Militar

                      </label>

                      <input

                          type="text"

                          value={buscaMilitar}

                          onChange={(e)=>{

                            setBuscaMilitar(

                                e.target.value

                            );

                            setMilitarSelecionado(null);

                            setForm({

                                militarId: "",

                                campanhaId: form.campanhaId,

                                chamadaId: form.chamadaId,

                                periodoInicio: form.periodoInicio,

                                periodoFim: form.periodoFim,

                                corrida: "",

                                flexao: "",

                                abdominal: "",

                                barra: "",

                                ppm: ""

                            });

                            setResultadoTempoReal({

                                mencaoCorrida: "--",

                                mencaoFlexao: "--",

                                mencaoAbdominal: "--",

                                mencaoBarra: "--",

                                mencaoPPM: "--",

                                mencaoFinal: "--"

                            });

                        }}

                          placeholder="Nome Completo ou Nome de Guerra"

                          className="w-full rounded-lg border px-3 py-2"

                      />

                      {

                          buscaMilitar.trim() !== ""

                          &&

                          militaresFiltrados.length>0

                          &&(

                              <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-64 overflow-auto">

                                  {

                                      militaresFiltrados.map(

                                          militar=>(

                                          <button

                                            key={militar.id}

                                            type="button"

                                            className="w-full text-left px-3 py-2 hover:bg-green-50"

                                            onClick={() => selecionarMilitar(militar)}

                                          >

                                            <strong>

                                              {militar.nomeGuerra}

                                            </strong>

                                            <br />

                                            <small>

                                              {militar.nomeCompleto}

                                            </small>

                                          </button>

                                          )

                                      )

                                  }

                              </div>

                          )

                      }

                  </div>

              </div>

          </div>

        {/* ============================
              ÍNDICES + RESULTADO
          ============================ */}

          <div className="grid grid-cols-12 gap-6">

              {/* ============================
                  ÍNDICES
              ============================ */}

              <div className="col-span-12 lg:col-span-8">

                  <div className="bg-white rounded-2xl shadow-lg p-6">

                      <h2 className="text-xl font-bold text-slate-800 mb-6">

                          Índices

                      </h2>

                      <div className="grid grid-cols-12 gap-5">

                          {/* CORRIDA */}

                          <div className="col-span-12 md:col-span-6">

                              <label className="block mb-1 font-medium">

                                  Corrida (m)

                              </label>

                              <input
                                ref={corridaRef}

                                type="number"

                                min="0"

                                step="1"

                                inputMode="numeric"

                                disabled={

                                  !militarSelecionado ||

                                  militarBloqueado
                                }

                                value={form.corrida}

                                onChange={(e)=>{

                                    const valor = e.target.value;

                                    if (/^\d*$/.test(valor)) {

                                        setForm({

                                            ...form,

                                            corrida: valor

                                        });

                                    }

                                }}

                                className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100"
                            />

                          </div>

                          {/* FLEXÃO */}

                          <div className="col-span-12 md:col-span-6">

                              <label className="block mb-1 font-medium">

                                  Flexão

                              </label>

                              <input
                                type="number"

                                min="0"

                                step="1"

                                inputMode="numeric"

                                disabled={

                                  !militarSelecionado ||

                                  militarBloqueado
                                }

                                value={form.flexao}

                                onChange={(e)=>{

                                    const valor = e.target.value;

                                    if (/^\d*$/.test(valor)) {

                                        setForm({

                                            ...form,

                                            flexao: valor

                                        });

                                    }

                                }}

                                className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100"
                            />

                          </div>

                          {/* ABDOMINAL */}

                          <div className="col-span-12 md:col-span-6">

                              <label className="block mb-1 font-medium">

                                  Abdominal

                              </label>

                              <input
                                type="number"

                                min="0"

                                step="1"

                                inputMode="numeric"

                                disabled={

                                  !militarSelecionado ||

                                  militarBloqueado
                                }

                                value={form.abdominal}

                                onChange={(e)=>{

                                    const valor = e.target.value;

                                    if (/^\d*$/.test(valor)) {

                                        setForm({

                                            ...form,

                                            abdominal: valor

                                        });

                                    }

                                }}

                                className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100"
                            />

                          </div>

                          {/* BARRA */}

                          <div className="col-span-12 md:col-span-6">

                              <label className="block mb-1 font-medium">

                                  Barra

                              </label>

                              <input
                                type="number"

                                min="0"

                                step="1"

                                inputMode="numeric"

                                disabled={

                                    !militarSelecionado ||

                                    dispensaBarra ||

                                    militarBloqueado
                                }

                                value={form.barra}

                                onChange={(e)=>{

                                    const valor = e.target.value;

                                    if (/^\d*$/.test(valor)) {

                                        setForm({

                                            ...form,

                                            barra: valor

                                        });

                                    }

                                }}

                                className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100"
                            />

                          </div>

                          {/* PPM */}

                          <div className="col-span-12 md:col-span-6">

                              <label className="block mb-1 font-medium">

                                  PPM

                              </label>

                              <select

                                disabled={

                                    buscaMilitar.trim() === "" ||

                                    dispensaPPM ||

                                    militarBloqueado
                                }

                                value={form.ppm}

                                onChange={(e)=>

                                    setForm({

                                      ...form,

                                      ppm: e.target.value

                                  })

                              }

                              className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100"

                            >

                              <option value="">Selecione</option>

                              <option value="S">Suficiente</option>

                              <option value="I">Insuficiente</option>

                            </select>

                          </div>

                      </div>

                      <div className="flex justify-end mt-8">

                          <button
                              type="submit"
                              className="bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-3 rounded-xl transition"
                          >

                              Salvar Avaliação

                          </button>

                      </div>

                  </div>

              </div>

              {/* ============================
                  RESULTADO AUTOMÁTICO
              ============================ */}

              <div className="col-span-12 lg:col-span-4">

                  <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">

                      <h2 className="text-xl font-bold text-slate-800 mb-6">

                          Menções

                      </h2>

                      <div className="space-y-3">

                          <div className="flex justify-between">

                              <span>Corrida</span>

                              <strong className={mencaoColor(resultadoTempoReal.mencaoCorrida)}>

                                  {resultadoTempoReal.mencaoCorrida || "--"}

                              </strong>

                          </div>

                          <div className="flex justify-between">

                              <span>Flexão</span>

                              <strong className={mencaoColor(resultadoTempoReal.mencaoFlexao)}>

                                  {resultadoTempoReal.mencaoFlexao || "--"}

                              </strong>

                          </div>

                          <div className="flex justify-between">

                              <span>Abdominal</span>

                              <strong className={mencaoColor(resultadoTempoReal.mencaoAbdominal)}>

                                  {resultadoTempoReal.mencaoAbdominal || "--"}

                              </strong>

                          </div>

                          <div className="flex justify-between">

                              <span>Barra</span>

                              <strong className={mencaoColor(resultadoTempoReal.mencaoBarra)}>

                                  {resultadoTempoReal.mencaoBarra || "--"}

                              </strong>

                          </div>

                          <div className="flex justify-between">

                            <span>PPM</span>

                            <strong className={mencaoColor(resultadoTempoReal.mencaoPPM)}>

                                {

                                    resultadoTempoReal.mencaoPPM === ""

                                    ||

                                    resultadoTempoReal.mencaoPPM == null

                                        ? "NR"

                                        : resultadoTempoReal.mencaoPPM

                                }

                            </strong>

                        </div>

                          <hr className="my-5"/>

                          <div className="text-center">

                              <div className="text-sm text-gray-500">

                                  MENÇÃO FINAL

                              </div>

                              <div
                                  className={`text-5xl font-bold mt-2 ${mencaoColor(resultadoTempoReal.mencaoFinal)}`}
                              >

                                  {resultadoTempoReal.mencaoFinal || "--"}

                              </div>

                          </div>

                      </div>

                  </div>

              </div>

          </div>

        </form>

      )}

      {/* ============================
          ABA HISTÓRICO
      ============================ */}

      {abaAtiva === "historico" && (

          <div className="bg-white rounded-2xl shadow-lg p-6">

              <div className="flex justify-between items-center mb-6">

                  <h2 className="text-xl font-bold text-slate-800">

                      Histórico das Avaliações

                  </h2>

                  <input
                      type="text"
                      placeholder="Pesquisar militar..."
                      value={busca}
                      onChange={(e)=>setBusca(e.target.value)}
                      className="border rounded-lg px-3 py-2 w-72"
                  />

              </div>

              <div className="overflow-x-auto">

                  <table className="w-full">

                      <thead>

                          <tr className="bg-green-700 text-white">

                              <th className="text-left p-3">

                                  Ação

                              </th>

                              <th className="text-left p-3">

                                  Militar

                              </th>

                              <th className="text-left p-3">

                                  Data/Hora

                              </th>

                              <th className="text-left p-3">

                                  Usuário

                              </th>

                          </tr>

                      </thead>

                      <tbody>

                        {

                          historico.length === 0 && (

                            <tr>

                              <td
                                colSpan="4"
                                className="text-center py-10 text-gray-500"
                              >

                                Nenhum registro encontrado.

                              </td>

                            </tr>

                          )

                        }

                        {

                          historico

                            .filter((log) =>

                              !busca ||

                              log.avaliacao?.militar?.nomeGuerra

                                ?.toLowerCase()

                                .includes(

                                  busca.toLowerCase()

                                )

                            )

                            .map((log) => (

                              <tr

                                key={log.id}

                                className="border-b hover:bg-gray-50"

                              >

                                <td className="p-3">

                                  {

                                    log.acao === "CADASTRO"

                                      ? "Cadastro"

                                      : "Atualização"

                                  }

                                </td>

                                <td className="p-3">

                                  {

                                    log.avaliacao?.militar?.nomeGuerra

                                  }

                                </td>

                                <td className="p-3">

                                  {

                                    new Date(

                                      log.createdAt

                                    ).toLocaleString(

                                      "pt-BR"

                                    )

                                  }

                                </td>

                                <td className="p-3">

                                  {

                                    log.usuario?.nome ?? "-"

                                  }

                                </td>

                              </tr>

                            ))

                        }

                      </tbody>

                  </table>

              </div>

          </div>

        )}

    </div>

    );
  }