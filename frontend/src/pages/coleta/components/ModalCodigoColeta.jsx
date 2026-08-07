import { useState } from "react";

export default function ModalCodigoColeta({

  aberto,

  codigo,

  onFechar

}) {

  const [copiado, setCopiado] = useState(false);

  if (!aberto) return null;

  async function copiarCodigo() {

    try {

      await navigator.clipboard.writeText(codigo);

      setCopiado(true);

      setTimeout(() => {

        setCopiado(false);

      }, 2000);

    }

    catch {

      alert("Não foi possível copiar o código.");

    }

  }

  const codigoFormatado = codigo.replace(

    /(\d{3})(\d{3})/,

    "$1 $2"

  );

  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">

        <div className="text-center">

          <div className="text-5xl mb-4">

            ✅

          </div>

          <h2 className="text-2xl font-bold text-green-700">

            Coleta Gerada!

          </h2>

          <p className="mt-6 text-gray-700 font-semibold">

            Código de Autenticação da Coleta

          </p>

          <div className="mt-5 text-5xl font-black tracking-widest text-green-800 select-all">

            {codigoFormatado}

          </div>

          <p className="mt-6 text-red-600 text-sm font-semibold">

            Informe ao Avaliador responsável!

          </p>

          <p className="text-gray-500 text-xs mt-1">

            Este código será exibido apenas uma vez.

          </p>

        </div>

        <div className="mt-8 flex flex-col gap-3">

          <button

            type="button"

            onClick={copiarCodigo}

            className="bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold transition"

          >

            {

              copiado

                ? "✅ Código copiado!"

                : "📋 Copiar Código"

            }

          </button>

          <button

            type="button"

            onClick={onFechar}

            className="border border-gray-300 hover:bg-gray-100 py-3 rounded-xl font-semibold"

          >

            Fechar

          </button>

        </div>

      </div>

    </div>

  );

}