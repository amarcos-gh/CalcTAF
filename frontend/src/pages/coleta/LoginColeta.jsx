import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import bcrypt from "bcryptjs";

import {
  importarColeta,
  obterColeta,
  listarAvaliacoes,
  loginBloqueado,
  incrementarTentativas,
  resetarTentativas,
  registrarLogin
} from "../../database/indexedDB";

import {

  STATUS_AVALIACAO

} from "../../services/calculoTAF";

import CabecalhoColeta from "./components/CabecalhoColeta";
import ImportarColeta from "./ImportarColeta";

export default function LoginColeta() {

  const navigate = useNavigate();

  const codigoRef = useRef(null);

  // ======================================================
  // STATES
  // ======================================================

  const [coleta, setColeta] = useState(null);

  const [email, setEmail] = useState("");

  const [codigo, setCodigo] = useState("");

  const [mensagem, setMensagem] = useState("");

  const [carregando, setCarregando] = useState(false);

  const [importando, setImportando] = useState(false);

  const [progresso, setProgresso] = useState(0);

  const [bloqueado, setBloqueado] = useState(false);

  const [tempoBloqueio, setTempoBloqueio] = useState(0);

  const [mostrarContinuacao, setMostrarContinuacao] = useState(false);

  const [resumoSessao, setResumoSessao] = useState(null);

  const [coletaConcluida, setColetaConcluida] = useState(false);

  const [mostrarGerarResultados, setMostrarGerarResultados] = useState(false);

  const [qtdPendentes, setQtdPendentes] = useState(0);

  const [qtdNaoRealizados, setQtdNaoRealizados] = useState(0);

  // ======================================================
  // APÓS IMPORTAR O .CTAF
  // ======================================================

  async function carregarColeta(dados) {

    setColeta(dados);

    setEmail(

      dados.avaliador?.email ||

      dados.email ||

      ""

    );

    setCodigo("");

    setMensagem("");

    setProgresso(25);

    setTimeout(() => {

      codigoRef.current?.focus();

    }, 150);

  }

  // ======================================================
  // VERIFICA SESSÃO EM ANDAMENTO
  // ======================================================

  async function verificarSessaoEmAndamento() {

    const coletaSalva = await obterColeta();

    if (!coletaSalva) {

      return;

    }

    setColeta(coletaSalva);

    const avaliacoes = await listarAvaliacoes();

    if (!avaliacoes || avaliacoes.length === 0) {

      return;

    }

    const total = coletaSalva.militares?.length || 0;

    const avaliados = avaliacoes.filter(

      a => a.status === STATUS_AVALIACAO.AVALIADO

    ).length;

    const pendentes = avaliacoes.filter(

      a => a.status === STATUS_AVALIACAO.PENDENTE

    ).length;

    const naoRealizados =

      total -

      avaliados -

      pendentes;

    setColetaConcluida(pendentes === 0);

    setResumoSessao({

      coleta: coletaSalva,

      total,

      avaliados,

      pendentes,

      naoRealizados

    });

    setMostrarContinuacao(true);

  }

  // ======================================================
  // CONTINUAR SESSÃO
  // ======================================================

  function continuarSessao() {

    setMostrarContinuacao(false);

    navigate("/coleta/aplicacao");

  }

  // ======================================================
  // GERAR RESULTADOS
  // ======================================================

  async function gerarResultados() {

    console.log("GERAR RESULTADOS CLICADO");

    const coleta = await obterColeta();

    const avaliacoes = await listarAvaliacoes();

    const pendentes = resumoSessao?.pendentes ?? 0;

    const naoRealizados = resumoSessao?.naoRealizados ?? 0;

    if (

      pendentes > 0 ||

      naoRealizados > 0

    ) {

      setQtdPendentes(pendentes);

      setQtdNaoRealizados(naoRealizados);

      setMostrarGerarResultados(true);

      return;

    }

    const resultados = {

      tipo: "RESULTADO_AVALIACAO",

      versao: "1.0",

      idResultados: crypto.randomUUID(),

      geradoEm: new Date().toISOString(),

      hashAutenticacao: coleta.hashAutenticacao,

      om: coleta.om,

      subunidade: coleta.subunidade,

      campanha: coleta.campanha,

      chamada: coleta.chamada,

      avaliador: coleta.avaliador,

      militares: coleta.militares.length,

      avaliacoes

    };

    console.log(resultados);

    alert(

      `Arquivo preparado com ${avaliacoes.length} avaliações.`

    );

  }

  async function gerarArquivoResultados() {

    const coleta = await obterColeta();

    const avaliacoes = await listarAvaliacoes();

    const resultados = {

      tipo: "RESULTADO_AVALIACAO",

      versao: "1.0",

      idResultados: crypto.randomUUID(),

      geradoEm: new Date().toISOString(),

      om: coleta.om,

      subunidade: coleta.subunidade,

      campanha: coleta.campanha,

      chamada: coleta.chamada,

      avaliador: coleta.avaliador,

      militares: coleta.militares.length,

      avaliacoes: avaliacoes.map((avaliacao) => {

        const militar = coleta.militares.find(

          (m) => m.id === avaliacao.militarId

        );

        return {

          ...avaliacao,

          nomeGuerra: militar?.nomeGuerra ?? "",

          nomeCompleto:

          militar?.nomeCompleto ??

          militar?.nome ??

          "",

          postoGraduacao:

            militar?.postoGraduacao?.abreviacao ??

            militar?.postoGraduacao ??

            "",

            curso:

              militar?.curso?.codigo ??

              militar?.curso ??

              "",

          subunidade:

            militar?.subunidade?.nome ??

            militar?.subunidade ??

            "",

          segmento:

            militar?.segmento ?? ""

        };

      })

    };

    const blob = new Blob(

      [

        JSON.stringify(

          resultados,

          null,

          2

        )

      ],

      {

        type: "application/json"

      }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    const nomeArquivo =

      `Resultados_${

        coleta.subunidade?.abreviacao ||

        coleta.subunidade?.nome ||

        coleta.subunidade

      }_${

        coleta.campanha.ano

      }_${

        coleta.campanha.numeroTAF

      }TAF_${

        coleta.chamada.numeroChamada

      }Chamada.ctaf`;

    link.href = url;

    link.download = nomeArquivo;

    link.click();

    URL.revokeObjectURL(url);

  }

  // ======================================================
  // CANCELAR CONTINUAÇÃO
  // ======================================================

  function cancelarContinuacao() {

    setMostrarContinuacao(false);

    setResumoSessao(null);

    setColeta(null);

    setEmail("");

    setCodigo("");

    setMensagem("");

    setProgresso(0);

  }

  useEffect(() => {

    verificarSessaoEmAndamento();

  }, []);

  // ======================================================
  // IMPORTAÇÃO AUTOMÁTICA
  // ======================================================

  async function importarAutomaticamente() {

    if (!coleta || importando) {

      return;

    }

    const codigoLimpo = codigo.trim();

      if (codigoLimpo.length !== 6) {
        return;
      }

      // Verifica se o login está bloqueado
      if (await loginBloqueado()) {

        setMensagem(
          "Login bloqueado. Aguarde 15 minutos para tentar novamente."
        );

        setProgresso(25);

        codigoRef.current?.blur();

        return;
      }

    const hashCodigo =
      coleta?.chamada?.codigoAutenticacaoHash || "";

    if (!hashCodigo) {

      setMensagem(

        "Arquivo de coleta inválido ou sem código de autenticação."

      );

      setProgresso(25);

      return;

    }

    setProgresso(50);

    const autenticado =
      await bcrypt.compare(

        codigoLimpo,

        hashCodigo

      );

      if (!autenticado) {

        const resultado = await incrementarTentativas();

        if (resultado?.tentativasRestantes > 1) {

          setMensagem(
            `Código de Autentificação inválido. Restam ${resultado.tentativasRestantes} tentativas.`
          );

        } else if (resultado?.tentativasRestantes === 1) {

          setMensagem(
            "Código de Autentificação inválido. Última tentativa."
          );

        } else {

          setMensagem(
            "Login bloqueado por 15 minutos."
          );

        }

        codigoRef.current?.select();

        setProgresso(25);

        return;
      }

    // Login realizado com sucesso
      await resetarTentativas();

      await registrarLogin();

      try {

        setImportando(true);

        setMensagem("Preparando coleta...");

        setProgresso(25);

        await new Promise(resolve => setTimeout(resolve, 150));

        setMensagem("Importando coleta...");

        setProgresso(50);

        await importarColeta(coleta);

        await new Promise(resolve => setTimeout(resolve, 150));

        setMensagem("Organizando dados...");

        setProgresso(75);

        await new Promise(resolve => setTimeout(resolve, 150));

        setMensagem("Abrindo avaliação...");

        setProgresso(100);

        setTimeout(() => {

          navigate("/coleta/aplicacao");

        }, 250);

      }

      catch (erro) {

        console.error(erro);

        setImportando(false);

        setMensagem("Erro ao importar a coleta.");

        setProgresso(0);

      }

  }

  // ======================================================
  // CÓDIGO DIGITADO
  // ======================================================

  useEffect(() => {

    if (importando) {

      return;

    }

    importarAutomaticamente();

  }, [codigo]);

  // ======================================================
  // CARREGANDO
  // ======================================================

  if (carregando) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        Carregando...

      </div>

    );

  }

  return (

  <div className="min-h-screen bg-green-900 flex flex-col items-center justify-center p-4">

    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">

      <CabecalhoColeta
        siglaOM={coleta?.om?.sigla}
        subunidade={
          coleta?.subunidade ??
          coleta?.su
        }
      />

      {/* =======================================================
          TELA DE IMPORTAÇÃO
      ======================================================= */}

      {!coleta && (

        <div className="mt-8 text-center space-y-6">

          <p className="text-gray-600 text-base leading-relaxed">

            Selecione o arquivo da coleta para iniciar a avaliação.

          </p>

          <ImportarColeta

            textoBotao="📥 IMPORTAR COLETA"

            onImportado={carregarColeta}

          />

        </div>

      )}

      {/* =======================================================
          TELA DE LOGIN
      ======================================================= */}

      {coleta && (

        <div className="space-y-5 mt-6">

          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">

            <div className="font-bold text-green-700 text-lg">

              ✔ Coleta importada com sucesso

            </div>

            <div className="mt-2 text-sm text-gray-700">

              <div>

                <strong>OM:</strong>{" "}

                {coleta?.om?.sigla || ""}

              </div>

              <div>

                <strong>Subunidade:</strong>{" "}

                {coleta?.subunidade?.nome ||

                coleta?.subunidade ||

                ""}

              </div>

              <div>

                <strong>Chamada:</strong>{" "}

                {coleta?.chamada?.numeroChamada}ª Chamada

              </div>

              <div>

                <strong>Avaliador:</strong>{" "}

                {coleta?.avaliador?.nome || ""}

              </div>

              <div>

                <strong>Militares:</strong>{" "}

                {coleta?.militares?.length || 0}

              </div>

            </div>

          </div>          

          <div>

            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

              <div

                className="bg-green-700 h-full transition-all duration-300"

                style={{

                  width: `${progresso}%`

                }}

              />

            </div>

          </div>

          <p className="text-center text-sm text-gray-600">

            {

              progresso === 25

                ? "Preparando autenticação..."

                : progresso < 50

                ? "Coleta carregada"

                : progresso < 75

                ? "Validando código..."

                : progresso < 100

                ? "Importando coleta..."

                : "Abrindo aplicação..."

            }

          </p>

          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">

              Código de Autentificação

            </label>

            <input

              ref={codigoRef}

              type="password"

              autoComplete="off"

              disabled={importando}

              value={codigo}

              onChange={(e) => setCodigo(e.target.value)}

              placeholder="Digite o Código de Autentificação"

              className="w-full rounded-full border px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-800"

            />

          </div>

          {mensagem && (

            <p

              className={`text-center text-sm font-medium ${
                mensagem.startsWith("Código") ||
                mensagem.startsWith("Login")
                  ? "text-red-600"
                  : "text-blue-700"
              }`}

            >

              {mensagem}

            </p>

          )}

        </div>

            )}

    </div>

    {

      mostrarContinuacao && resumoSessao && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl shadow-2xl w-[320px] p-6">

            <h2 className="text-center text-lg font-bold text-green-700">

              ATENÇÃO

            </h2>

            <div className="mt-4 text-sm text-gray-700 space-y-2">

              <div className="text-center font-semibold">

                {resumoSessao.coleta.campanha?.numeroTAF}º TAF • {resumoSessao.coleta.chamada?.numeroChamada}ª Chamada

              </div>

              <div className="text-center">

                {

                  resumoSessao.coleta.subunidade?.nome ||

                  resumoSessao.coleta.subunidade ||

                  ""

                }

              </div>

              <hr />

              <div className="flex justify-between">

                <span>Militares</span>

                <strong>{resumoSessao.total}</strong>

              </div>

              <div className="flex justify-between">

                <span>Avaliados</span>

                <strong>{resumoSessao.avaliados}</strong>

              </div>

              <div className="flex justify-between">

                <span>Pendentes</span>

                <strong>{resumoSessao.pendentes}</strong>

              </div>

              <div className="flex justify-between">

                <span>Não Realizados</span>

                <strong>{resumoSessao.naoRealizados}</strong>

              </div>

              </div>

              <div className="mt-6 flex gap-2">

              {

                !coletaConcluida && (

                  <button

                    onClick={continuarSessao}

                    className="flex-1 bg-green-700 hover:bg-green-800 text-white rounded-xl py-2 font-semibold"

                  >

                    CONTINUAR

                  </button>

                )

              }

              <button

                onClick={gerarResultados}

                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white rounded-xl py-2 font-semibold"

              >

                GERAR RESULTADOS

              </button>

            </div>

            <div className="mt-2">

              <button

                onClick={cancelarContinuacao}

                className="w-full bg-gray-500 hover:bg-gray-600 text-white rounded-xl py-2 font-semibold"

              >

                CANCELAR

              </button>

            </div>

            </div>

            </div>

            )

            }

    {
      mostrarGerarResultados && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl shadow-2xl w-[320px] p-6">

            <h2 className="text-center text-lg font-bold text-green-700">

              GERAR RESULTADOS

            </h2>

            <div className="mt-4 text-sm text-gray-700 space-y-3">

              {

                qtdPendentes > 0 && (

                  <div>

                    • <strong>{qtdPendentes}</strong> militar(es) com avaliação <strong>PENDENTE</strong>.

                  </div>

                )

              }

              {

                qtdNaoRealizados > 0 && (

                  <div>

                    • <strong>{qtdNaoRealizados}</strong> militar(es) <strong>NÃO REALIZARAM</strong> o TAF.

                  </div>

                )

              }

              <div className="pt-2 text-center">

                Esses status permanecerão registrados no arquivo de resultados.

              </div>

              <div className="text-center font-semibold text-red-600">

                Deseja gerar os resultados mesmo assim?

              </div>

            </div>

            <div className="mt-6 flex gap-2">

              <button

                onClick={() => setMostrarGerarResultados(false)}

                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white rounded-xl py-2 font-semibold"

              >

                CANCELAR

              </button>

              <button

                onClick={async () => {

                  setMostrarGerarResultados(false);

                  await gerarArquivoResultados();

                }}

                className="flex-1 bg-green-700 hover:bg-green-800 text-white rounded-xl py-2 font-semibold"

              >

                GERAR

              </button>

            </div>

          </div>

        </div>

      )
    }

    <div className="w-full max-w-sm mt-2 text-right text-white text-[11px]">

      © 2026 STen Antonio Marcos

    </div>

  </div>

  );

}