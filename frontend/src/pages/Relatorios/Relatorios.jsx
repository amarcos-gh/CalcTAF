import { useEffect, useState } from "react";

import api from "../../services/api";

import { FileText } from "lucide-react";

export default function Relatorios() {

  const nomeOM =

  localStorage.getItem(
    "nomeOM"
  ) || "NOME DA OM";

  const omId =

  Number(

    localStorage.getItem(

      "omId"
    )
  );

  const [avaliacoes, setAvaliacoes] = useState([]);

  const [militares, setMilitares] = useState([]);

  const [campanhas, setCampanhas] = useState([]);

  const [subunidades, setSubunidades] = useState([]);

  const [avaliacoesFiltradas, setAvaliacoesFiltradas] = useState([]);

  const [
    testeSelecionado,
    setTesteSelecionado
  ] = useState(null);

  const [
    chamadaSelecionada,
    setChamadaSelecionada
  ] = useState(null);

  const [
    subunidadeSelecionada,
    setSubunidadeSelecionada
  ] = useState(null);

  const [
    tipoRelatorio,
    setTipoRelatorio
  ] = useState(null);

  const [
    tituloEsquerda,
    setTituloEsquerda
  ] = useState("");

  const [
    tituloDireita,
    setTituloDireita
  ] = useState("");

  useEffect(() => {

    carregarDados(

      true

    );

  }, []);

  const [

    paginaAtual,

    setPaginaAtual

  ] = useState(1);

  const [abaSelecionada, setAbaSelecionada] = useState("OM");

  const [mostrarRelatorio, setMostrarRelatorio] = useState(false);

  const ITENS_POR_PAGINA = 20;

  useEffect(() => {

    async function carregarRelatorio() {

      if (

        testeSelecionado

        &&

        chamadaSelecionada

      ) {

        await carregarDados(

          true
        );
      }
    }

    carregarRelatorio();

  }, [

    testeSelecionado,

    chamadaSelecionada
  ]);

  useEffect(() => {

    filtrarAvaliacoes();

  }, [

    avaliacoes,

    testeSelecionado,

    chamadaSelecionada,

    subunidadeSelecionada,

    tipoRelatorio
  ]);

  async function carregarDados(

    carregarRelatorio = false

  ) {

    try {

      const [

        campanhasResponse,

        subunidadesResponse

      ] = await Promise.all([

        api.get("/campanhas"),

        api.get(`/subunidades?omId=${omId}`)
      ]);

      setCampanhas(

        campanhasResponse.data
      );

      setSubunidades(

        subunidadesResponse.data
      );

      if (

        carregarRelatorio

      ) {

        const [

          avaliacoesResponse,

          militaresResponse

        ] = await Promise.all([

          api.get(

            `/avaliacoes?omId=${omId}`

          ),

          api.get(

            `/militares?omId=${omId}`

          )

        ]);

        setAvaliacoes(

          avaliacoesResponse.data
        );

        setMilitares(
          militaresResponse.data
        );
      }

    } catch (

      error

    ) {

      console.error(

        error
      );
    }
      }

  function filtrarAvaliacoes() {

    const filtradas =

      avaliacoes.filter((avaliacao) => {

        const omOk = true;

        const testeOk =

          !testeSelecionado

          ||

          Number(

            avaliacao.chamada
              ?.campanha?.id

          ) ===

          Number(

            testeSelecionado
          );

        const chamadaOk =

          !chamadaSelecionada

          ||

          Number(

            avaliacao.chamadaId

          ) ===

          Number(

            chamadaSelecionada
          );

        const subunidadeOk =

          tipoRelatorio ===
          "OM"

          ||

          !subunidadeSelecionada

          ||

          Number(

            avaliacao.militar
              ?.subunidadeId

          ) ===

          Number(

            subunidadeSelecionada
          );

        return (

          omOk

          &&

          testeOk

          &&

          chamadaOk

          &&

          subunidadeOk
        );
      });

    setAvaliacoesFiltradas(

      filtradas
    );

    setPaginaAtual(

      1
    );
  }

  function abrirRelatorioGeral(
    tafId,
    chamadaId,
    titulo
  ) {

    setTipoRelatorio(
      "OM"
    );

    setTesteSelecionado(
      tafId
    );

    setChamadaSelecionada(
      chamadaId
    );

    setSubunidadeSelecionada(
      null
    );

    setTituloEsquerda(
      "OM"
    );

    setTituloDireita(
      titulo
    );
  }

  function abrirRelatorioSU(
    suId,
    tafId,
    chamadaId,
    nomeSU,
    titulo
  ) {

    setTipoRelatorio(
      "SU"
    );

    setSubunidadeSelecionada(
      suId
    );

    setTesteSelecionado(
      tafId
    );

    setChamadaSelecionada(
      chamadaId
    );

    setTituloEsquerda(
      nomeSU
    );

    setTituloDireita(
      titulo
    );
  }

  /*
    ESTES MÉTODOS SERÃO
    CHAMADOS PELO MENU
    CalcTAF Web / SIDEBAR
  */

  window.abrirRelatorioGeral =
    abrirRelatorioGeral;

  window.abrirRelatorioSU =
      abrirRelatorioSU;

    const periodoInicio =

    avaliacoesFiltradas.length > 0

    ?

    avaliacoesFiltradas[0]
      ?.chamada
      ?.periodoInicio

    :

    null;

    const periodoFim =

    avaliacoesFiltradas.length > 0

    ?

    avaliacoesFiltradas[0]
      ?.chamada
      ?.periodoFim

    :

    null;

    function formatarData(data) {

      if (!data) {

        return "";

      }

      const [ano, mes, dia] = data
        .substring(0, 10)
        .split("-");

      return `${dia}/${mes}/${ano}`;

    }

    const militaresRelatorio =
        militares
          .filter(
            (militar) =>
              tipoRelatorio === "OM" ||
              Number(militar.subunidadeId) ===
                Number(subunidadeSelecionada)
          )
          .map((militar) => {

          const avaliacao =
            avaliacoesFiltradas.find(
              (a) =>
                Number(a.militarId) === Number(militar.id) &&
                Number(a.chamadaId) === Number(chamadaSelecionada)
            );

            /*
            * =====================================================
            * REGRA 1
            * MILITAR SEM AVALIAÇÃO
            *
            * Menção Final = NR
            * Suficiência = vazio
            * =====================================================
            */

            if (!avaliacao) {

              return {

                id: militar.id,

                militar,

                mencaoFinal: "NR",

                suficiencia: ""

              };

            }

            /*
            * =====================================================
            * MENÇÃO ORIGINAL
            * =====================================================
            */

            const mencaoOriginal =
              String(
                avaliacao.mencaoFinal ?? "NR"
              ).trim().toUpperCase();

            if (
              mencaoOriginal === "" &&
              (
                avaliacao.suficiencia === "S" ||
                avaliacao.suficiencia === "NS"
              )
            ) {
              return {
                id: militar.id,
                militar,
                mencaoFinal: "",
                suficiencia: avaliacao.suficiencia
              };
            }

            /*
            * =====================================================
            * REGRA 2
            * NR NUNCA PODE TER SUFICIÊNCIA
            *
            * Mesmo que o backend ou outro processamento
            * tenha enviado suficiencia = "S" ou "NS",
            * aqui ela será obrigatoriamente apagada.
            * =====================================================
            */

            if (mencaoOriginal === "NR") {

              return {

                id: militar.id,

                militar,

                mencaoFinal: "NR",

                suficiencia: ""

              };

            }

            /*
            * =====================================================
            * CALCULA IDADE
            * =====================================================
            */

            let idade = null;

            if (militar.dataNascimento) {

              const hoje = new Date();

              const nascimento =
                new Date(
                  militar.dataNascimento
                );

              idade =
                hoje.getFullYear() -
                nascimento.getFullYear();

              const mes =
                hoje.getMonth() -
                nascimento.getMonth();

              if (
                mes < 0 ||
                (
                  mes === 0 &&
                  hoje.getDate() < nascimento.getDate()
                )
              ) {

                idade--;

              }

            }

            /*
            * =====================================================
            * REGRA 3
            * MILITAR COM 50 ANOS OU MAIS
            *
            * S -> Menção Final vazia / Suficiência S
            * I -> Menção Final vazia / Suficiência NS
            * =====================================================
            */

            if (idade !== null && idade >= 50) {

              if (mencaoOriginal === "S") {

                return {

                  id: militar.id,

                  militar,

                  mencaoFinal: "",

                  suficiencia: "S"

                };

              }

              if (mencaoOriginal === "I") {

                return {

                  id: militar.id,

                  militar,

                  mencaoFinal: "",

                  suficiencia: "NS"

                };

              }

            }

            /*
            * =====================================================
            * REGRA 4
            * MILITAR COM MENOS DE 50 ANOS
            *
            * E / MB / B -> S
            * R / I      -> NS
            * =====================================================
            */

            if (mencaoOriginal === "E") {

              return {

                id: militar.id,

                militar,

                mencaoFinal: "E",

                suficiencia: "S"

              };

            }

            if (mencaoOriginal === "MB") {

              return {

                id: militar.id,

                militar,

                mencaoFinal: "MB",

                suficiencia: "S"

              };

            }

            if (mencaoOriginal === "B") {

              return {

                id: militar.id,

                militar,

                mencaoFinal: "B",

                suficiencia: "S"

              };

            }

            if (mencaoOriginal === "R") {

              return {

                id: militar.id,

                militar,

                mencaoFinal: "R",

                suficiencia: "NS"

              };

            }

            if (mencaoOriginal === "I") {

              return {

                id: militar.id,

                militar,

                mencaoFinal: "I",

                suficiencia: "NS"

              };

            }

            /*
            * =====================================================
            * SEGURANÇA
            *
            * Qualquer situação não prevista fica sem
            * suficiência, mas mantém a menção recebida.
            * =====================================================
            */

            return {

              id: militar.id,

              militar,

              mencaoFinal: mencaoOriginal,

              suficiencia: ""

            };

          });

  const concluidos =
    militaresRelatorio.filter(
      (m) =>
        m.suficiencia === "S" ||
        m.suficiencia === "NS"
    );

  const pendentes =
    militaresRelatorio.filter(
      (m) =>
        m.suficiencia === ""
    );

    concluidos.sort((a, b) => {

  const ordemA =
    Number(
      a.militar?.postoGraduacao?.ordem || 999
    );

  const ordemB =
    Number(
      b.militar?.postoGraduacao?.ordem || 999
    );

  if (ordemA !== ordemB) {

    return ordemA - ordemB;
  }

  return (a.militar?.nomeGuerra || "").localeCompare(
    b.militar?.nomeGuerra || "",
    "pt-BR"
  );

});


pendentes.sort((a, b) => {

  const ordemA =
    Number(a.militar?.postoGraduacao?.ordem || 999);

  const ordemB =
    Number(b.militar?.postoGraduacao?.ordem || 999);

  if (ordemA !== ordemB) {

    return ordemA - ordemB;
  }

  return (a.militar?.nomeGuerra || "").localeCompare(
  b.militar?.nomeGuerra || "",
  "pt-BR"
);

});

    const indiceInicial =

      (paginaAtual - 1)

      * ITENS_POR_PAGINA;
      
    const resultadoFinal = [

      ...concluidos,

      ...pendentes

    ].sort((a, b) => {

      const aConcluido =

        a.mencaoFinal !== "NR";

      const bConcluido =

        b.mencaoFinal !== "NR";

      // Primeiro: concluídos antes dos NR
      if (aConcluido !== bConcluido) {

        return aConcluido ? -1 : 1;
      }

      // Segundo: hierarquia militar
      const ordemA =
        a.militar?.postoGraduacao?.ordem || 999;

      const ordemB =
        b.militar?.postoGraduacao?.ordem || 999;

      if (ordemA !== ordemB) {

        return ordemA - ordemB;
      }

      // Terceiro: nome de guerra
      return (a.militar?.nomeGuerra || "").localeCompare(

        b.nomeGuerra || "",

        "pt-BR"
      );

    });

    const totalMilitares =
      resultadoFinal.length;

    const totalConcluidos =
      concluidos.length;

    const totalPendentes =
      pendentes.length;

    const percentualConcluido =
      totalMilitares > 0
        ? (
            totalConcluidos
            / totalMilitares
          ) * 100
        : 0;

    const indiceFinal =

      indiceInicial

      + ITENS_POR_PAGINA;

    const avaliacoesPagina =

    resultadoFinal.slice(

      indiceInicial,

      indiceFinal
    );

    const totalPaginas =

    Math.ceil(

      resultadoFinal.length

      /

      ITENS_POR_PAGINA
    );

    return (

    <div className="space-y-6">

      <div className="nao-imprimir">

        {/* SELEÇÃO DO RELATÓRIO */}

        <div
          className="
            bg-white
            rounded-2xl
            shadow-lg
            p-5
          "
        >

      <div
        className="
          flex
          justify-between
          items-center
          mb-5
        "
      >

        <div
          className="
            flex
            gap-2
          "
        >

          <button
            onClick={() => {

              setMostrarRelatorio(false);

              setAbaSelecionada("OM");

            }}
            className={`
              px-5
              py-2
              rounded-lg
              font-semibold
              transition
              ${
                abaSelecionada === "OM"
                  ? "bg-green-700 text-white"
                  : "bg-slate-200 hover:bg-slate-300"
              }
            `}
          >
            OM
          </button>

          <button
            onClick={() => {

              setMostrarRelatorio(false);

              setAbaSelecionada("SU");

            }}
            className={`
              px-5
              py-2
              rounded-lg
              font-semibold
              transition
              ${
                abaSelecionada === "SU"
                  ? "bg-green-700 text-white"
                  : "bg-slate-200 hover:bg-slate-300"
              }
            `}
          >
            Subunidades
          </button>

        </div>

        <button

          type="button"

          title={
            mostrarRelatorio
              ? "Imprimir"
              : "Gere um relatório primeiro"
          }

          disabled={!mostrarRelatorio}

          onClick={() => window.print()}

          className={`
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-lg
            border
            transition-all

            ${
              mostrarRelatorio
                ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"
            }
          `}
        >

          PDF

        </button>

      </div>

      {abaSelecionada === "OM" ? (

        <div
          className="
            grid
            md:grid-cols-3
            gap-4
            items-end
          "
        >

          {/* TAF */}

          <div>

            <label className="block mb-1 font-semibold">
              TAF
            </label>

            <select
              value={testeSelecionado || ""}
              onChange={(e) => {

                setMostrarRelatorio(false);

                setTesteSelecionado(
                  Number(e.target.value)
                );

                setChamadaSelecionada(null);

              }}
              className="
                w-full
                border
                rounded-lg
                p-2
              "
            >

              <option value="">
                Selecione...
              </option>

              {campanhas.map((taf) => (

                <option
                  key={taf.id}
                  value={taf.id}
                >

                  {taf.numeroTAF}º TAF

                </option>

              ))}

            </select>

          </div>

          {/* CHAMADA */}

          <div>

            <label className="block mb-1 font-semibold">
              Chamada
            </label>

            <select
              value={chamadaSelecionada || ""}
              onChange={(e) => {

                setMostrarRelatorio(false);

                setChamadaSelecionada(
                  Number(e.target.value)
                );

              }}
              disabled={!testeSelecionado}
              className="
                w-full
                border
                rounded-lg
                p-2
              "
            >

              <option value="">
                Selecione...
              </option>

              {(campanhas.find(
                c => c.id === testeSelecionado
              )?.chamadas || []).map((c) => (

                <option
                  key={c.id}
                  value={c.id}
                >

                  {c.numeroChamada}ª Chamada

                </option>

              ))}

            </select>

          </div>

          {/* BOTÃO */}

          <div>

            <button

              onClick={() => {

                if (
                  !testeSelecionado ||
                  !chamadaSelecionada
                ) {

                  alert(
                    "Selecione o TAF e a Chamada."
                  );

                  return;

                }

                const taf = campanhas.find(
                  c => c.id === testeSelecionado
                );

                const chamada = taf.chamadas.find(
                  c => c.id === chamadaSelecionada
                );

                setMostrarRelatorio(true);

                abrirRelatorioGeral(

                  taf.id,

                  chamada.id,

                  `${taf.numeroTAF}º TAF - ${chamada.numeroChamada}ª Chamada`

                );

              }}

              className="
                w-full
                bg-green-700
                hover:bg-green-800
                text-white
                rounded-lg
                py-2
                font-semibold
              "
            >

              GERAR RELATÓRIO

            </button>

          </div>

        </div>

      ) : (

        <div
          className="
            grid
            md:grid-cols-4
            gap-4
            items-end
          "
        >

          {/* SUBUNIDADE */}

          <div>

            <label className="block mb-1 font-semibold">
              Subunidade
            </label>

            <select
              value={subunidadeSelecionada || ""}
              onChange={(e) => {

                setMostrarRelatorio(false);

                setSubunidadeSelecionada(
                  Number(e.target.value)
                );

              }}
              className="
                w-full
                border
                rounded-lg
                p-2
              "
            >

              <option value="">
                Selecione...
              </option>

              {subunidades.map((su) => (

                <option
                  key={su.id}
                  value={su.id}
                >

                  {su.nome}

                </option>

              ))}

            </select>

          </div>

          {/* TAF */}

          <div>

            <label className="block mb-1 font-semibold">
              TAF
            </label>

            <select
              value={testeSelecionado || ""}
              onChange={(e) => {

                setMostrarRelatorio(false);

                setTesteSelecionado(
                  Number(e.target.value)
                );

                setChamadaSelecionada(null);

              }}
              className="
                w-full
                border
                rounded-lg
                p-2
              "
            >

              <option value="">
                Selecione...
              </option>

              {campanhas.map((taf) => (

                <option
                  key={taf.id}
                  value={taf.id}
                >

                  {taf.numeroTAF}º TAF

                </option>

              ))}

            </select>

          </div>

          {/* CHAMADA */}

          <div>

            <label className="block mb-1 font-semibold">
              Chamada
            </label>

            <select
              value={chamadaSelecionada || ""}
              onChange={(e) => {

                setMostrarRelatorio(false);

                setChamadaSelecionada(
                  Number(e.target.value)
                );

              }}
              disabled={!testeSelecionado}
              className="
                w-full
                border
                rounded-lg
                p-2
              "
            >

              <option value="">
                Selecione...
              </option>

              {(campanhas.find(
                c => c.id === testeSelecionado
              )?.chamadas || []).map((c) => (

                <option
                  key={c.id}
                  value={c.id}
                >

                  {c.numeroChamada}ª Chamada

                </option>

              ))}

            </select>

          </div>

          {/* BOTÃO */}

          <div>

            <button

              onClick={() => {

                if (
                  !subunidadeSelecionada ||
                  !testeSelecionado ||
                  !chamadaSelecionada
                ) {

                  alert(
                    "Selecione Subunidade, TAF e Chamada."
                  );

                  return;

                }

                const su = subunidades.find(
                  s => s.id === subunidadeSelecionada
                );

                const taf = campanhas.find(
                  c => c.id === testeSelecionado
                );

                const chamada = taf.chamadas.find(
                  c => c.id === chamadaSelecionada
                );

                setMostrarRelatorio(true);

                abrirRelatorioSU(

                  su.id,

                  taf.id,

                  chamada.id,

                  su.nome,

                  `${taf.numeroTAF}º TAF - ${chamada.numeroChamada}ª Chamada`

                );

              }}

              className="
                w-full
                bg-green-700
                hover:bg-green-800
                text-white
                rounded-lg
                py-2
                font-semibold
              "
            >

              GERAR RELATÓRIO

            </button>

          </div>

        </div>

      )}

      </div>

  </div>

  {mostrarRelatorio && (

    <div id="relatorio-impressao">

    {/* CABEÇALHO */}

      <div
        className="
          bg-white
          rounded-2xl
          shadow-lg
          p-6
          text-center
        "
      >

        <p className="font-bold">

          MINISTÉRIO DA DEFESA

        </p>

        <p className="font-bold">

          EXÉRCITO BRASILEIRO

        </p>

        <p className="font-bold text-lg">

          {nomeOM}

        </p>

      </div>

      {/* TÍTULO */}

      <div
        className="
          bg-white
          rounded-2xl
          shadow-lg
          px-6
          py-4
          text-center
        "
      >

        <div
          className="
            flex
            justify-between
            items-center
            font-bold
          "
        >

          <span>

            {tituloEsquerda}

          </span>

          <span>

            {

              periodoInicio

              &&

              periodoFim

              &&

              `Período do TAF: ${formatarData(periodoInicio)} à ${formatarData(periodoFim)}`

            }

          </span>

          <span>

            {tituloDireita}

          </span>

        </div>

      </div>

      <div
        className="
          bg-slate-50
          rounded-xl
          p-4
          mb-4
          text-sm
          font-bold
          flex
          justify-center
          gap-8
        "
      >

        <span>
          Total: {totalMilitares}
        </span>

        <span>
          Concluídos: {totalConcluidos}
        </span>

        <span className="text-red-600">
          Pendentes (NR):
          {totalPendentes}
        </span>

        <span>
          {percentualConcluido.toFixed(1)}%
        </span>

      </div>

      {/* TABELA */}

      <div
        className="
          bg-white
          rounded-2xl
          shadow-lg
          p-6
          overflow-auto
        "
      >

        <table className="w-full table-fixed">

          <thead>

            <tr className="border-b">

              <th className="w-[28%] px-2 py-1.5 text-center text-sm">
                Nome Completo
              </th>

              <th className="w-[21%] px-2 py-1.5 text-center text-sm">
                Nome Guerra
              </th>

              <th className="w-[13%] px-2 py-1.5 text-center text-sm">
                Segmento
              </th>

              <th className="w-[13%] px-2 py-1.5 text-center text-sm">
                Curso
              </th>

              <th className="w-[12%] px-2 py-1.5 text-center text-sm">
                Menção Final
              </th>

              <th className="w-[13%] px-2 py-1.5 text-center text-sm whitespace-nowrap">
                Suficiência
              </th>

            </tr>

          </thead>

          <tbody>

            {resultadoFinal.length === 0 && (

              <tr>

                <td
                  colSpan={6}
                  className="
                    p-6
                    text-center
                    text-slate-500
                  "
                >

                  Nenhum militar encontrado.

                </td>

              </tr>
            )}

            {resultadoFinal
              .slice(
                indiceInicial,
                indiceInicial + ITENS_POR_PAGINA
              )
              .map(
                (avaliacao) => (

                <tr
                  key={avaliacao.id}
                  className="
                    border-b
                    text-xs
                  "
                >

                  <td className="px-3 py-1.5 text-center">
                    {avaliacao.militar?.nomeCompleto || "-"}
                  </td>

                  <td className="px-3 py-1.5 text-center">
                    {`${avaliacao.militar?.postoGraduacao?.abreviacao?.replaceAll("Â§", "Âº") || ""} ${avaliacao.militar?.nomeGuerra || "-"}`}
                  </td>

                  <td className="px-3 py-1.5 text-center">
                    {avaliacao.militar?.segmento === "M"
                      ? "Masculino"
                      : "Feminino"}
                  </td>

                  <td className="px-3 py-1.5 text-center">
                    {avaliacao.militar?.curso?.codigo || "-"}
                  </td>

                  <td className="px-3 py-2 text-center font-bold">
                    {avaliacao?.mencaoFinal === ""
                      ? "--"
                      : avaliacao?.mencaoFinal || "NR"}
                  </td>

                  <td className="px-3 py-2 text-center font-bold">
                    {avaliacao?.mencaoFinal === "NR"
                      ? ""
                      : avaliacao?.suficiencia || ""}
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

        <div
          className="
            mt-4
            flex
            justify-center
            items-center
            gap-8
            text-sm
            font-bold
          "
        >

          <button

            disabled={

              paginaAtual === 1

            }

            onClick={() =>

              setPaginaAtual(

                paginaAtual - 1
              )
            }

            className="disabled:text-slate-400"
          >

            ← Anterior

          </button>

          <span>

            Página

            {` ${paginaAtual} de ${totalPaginas}`}

          </span>

          <button

            disabled={

              paginaAtual === totalPaginas

            }

            onClick={() =>

              setPaginaAtual(

                paginaAtual + 1
              )
            }

            className="disabled:text-slate-400"
          >

            Próxima →

          </button>

        </div>

      </div>

    </div>

    )}

  </div>

  );
}