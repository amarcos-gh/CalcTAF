import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import bcrypt from "bcryptjs";

import {
  importarColeta
} from "../../database/indexedDB";

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
  // IMPORTAÇÃO AUTOMÁTICA
  // ======================================================

  async function importarAutomaticamente() {

    if (!coleta || importando) {

      return;

    }

    const hashCodigo =
      coleta.avaliador?.codigoHash ||
      coleta.avaliador?.senhaHash ||
      coleta.avaliador?.senha ||
      coleta.senhaHash ||
      "";

    setProgresso(50);

    const autenticado = await bcrypt.compare(

      codigo,

      hashCodigo

    );

    if (!autenticado) {

      setMensagem("Código de Certificação inválido.");

      setCodigo("");

      setProgresso(25);

      codigoRef.current?.focus();

      return;

    }

    try {

      setImportando(true);

      setMensagem("Importando coleta...");

      setProgresso(75);

      await importarColeta(coleta);

      setProgresso(100);

      setTimeout(() => {

        navigate("/coleta/aplicacao");

      }, 500);

    }

    catch (erro) {

      console.error(erro);

      setImportando(false);

      setMensagem("Erro ao importar a coleta.");

      setProgresso(25);

    }

  }

  // ======================================================
  // CÓDIGO DIGITADO
  // ======================================================

  useEffect(() => {

    if (!coleta) {

      return;

    }

    if (!codigo.trim()) {

      return;

    }

    const timer = setTimeout(() => {

      importarAutomaticamente();

    }, 300);

    return () => clearTimeout(timer);

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

        <div className="space-y-5 mt-6">

          {!coleta && (

            <>

              <ImportarColeta
                textoBotao="📥 IMPORTAR COLETA"
                onImportado={carregarColeta}
              />

              <p className="text-center text-sm text-gray-500">

                Selecione o arquivo da coleta para iniciar.

              </p>

            </>

          )}

          {coleta && (

            <>

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">

                  Organização Militar

                </label>

                <input

                  readOnly

                  value={
                    coleta.om?.sigla ||
                    coleta.om ||
                    ""
                  }

                  className="w-full rounded-full border px-5 py-3 bg-gray-100 text-gray-600"

                />

              </div>

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">

                  E-mail do Avaliador

                </label>

                <input

                  readOnly

                  value={email}

                  className="w-full rounded-full border px-5 py-3 bg-gray-100 text-gray-500"

                />

              </div>

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">

                  Código de Certificação

                </label>

                <input

                  ref={codigoRef}

                  type="password"

                  autoComplete="off"

                  disabled={importando}

                  value={codigo}

                  onChange={(e) => setCodigo(e.target.value)}

                  placeholder="Digite o Código de Certificação"

                  className="w-full rounded-full border px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-800"

                />

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

              <button

                disabled

                className="w-full rounded-full py-3 font-semibold text-white bg-green-900"

              >

                {

                  progresso < 25

                    ? "📥 IMPORTAR COLETA"

                    : progresso < 50

                    ? "Coleta carregada"

                    : progresso < 75

                    ? "Validando código..."

                    : progresso < 100

                    ? "Importando coleta..."

                    : "Abrindo aplicação..."

                }

              </button>

              {

                mensagem && (

                  <p

                    className={`

                      text-center

                      text-sm

                      font-medium

                      ${

                        mensagem.startsWith("Erro") ||

                        mensagem.startsWith("Código")

                          ? "text-red-600"

                          : "text-blue-700"

                      }

                    `}

                  >

                    {mensagem}

                  </p>

                )

              }

            </>

          )}

        </div>

      </div>

      <div className="w-full max-w-sm mt-2 text-right text-white text-[11px]">

        © 2026 STen Antonio Marcos

      </div>

    </div>

  );

}