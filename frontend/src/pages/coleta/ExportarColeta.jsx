import { useEffect, useState } from "react";

import CabecalhoColeta from "./components/CabecalhoColeta";

import {

  obterColeta,

  listarAvaliacoes

} from "../../database/indexedDB";

import pdfIcon from "../../assets/pdf.png";

export default function ExportarColeta() {

  const [coleta, setColeta] = useState(null);

  const [avaliacoes, setAvaliacoes] = useState([]);

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {

    async function carregar() {

    try {

      const [

        dadosColeta,

        listaAvaliacoes

      ] = await Promise.all([

        obterColeta(),

        listarAvaliacoes()

      ]);

      setColeta(dadosColeta);

      setAvaliacoes(listaAvaliacoes);

    }

    catch (erro) {

      console.error(erro);

      alert("Erro ao carregar os dados da coleta.");

    }

    finally {

      setCarregando(false);

    }

  }

    carregar();

  }, []);

  async function exportarColeta() {

    try {

      if (!coleta) {

        alert("Nenhuma coleta foi importada.");

        return;

      }

      if (avaliacoes.length === 0) {

        alert("Não existem avaliações armazenadas.");

        return;

      }

      const dados = {

        tipo: "AVALIACOES",

        versao: "2.0",

        sistema: "CalcTAF Campo",

        dataExportacao:
          new Date().toISOString(),

        om: coleta.om,

        subunidade:

          coleta.subunidade ??

          coleta.su,

        campanha: coleta.campanha,

        avaliador: coleta.avaliador,

        totalAvaliacoes:
          avaliacoes.length,

        avaliacoes

      };

      const json = JSON.stringify(

        dados,

        null,

        2

      );

      const blob = new Blob(

        [json],

        {

          type: "application/json"

        }

      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      const nomeArquivo =

      `AVALIACOES_${coleta.om.sigla}_${coleta.subunidade ?? coleta.su}_${coleta.campanha.numeroTAF}TAF_${coleta.campanha.numeroChamada}CH.ctaf`;

      link.href = url;

      link.download = nomeArquivo;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      alert(

        `${avaliacoes.length} avaliação(ões) exportada(s) com sucesso.`

      );

    } catch (erro) {

      console.error(erro);

      alert(

        erro.message ||

        "Erro ao exportar avaliações."

      );

    }

  }

  if (carregando) {

    return (

      <div className="min-h-screen bg-green-900 flex items-center justify-center">

        <div className="bg-white rounded-3xl shadow-xl p-8">

          Carregando...

        </div>

      </div>

    );

  }

  if (!coleta) {

    return (

      <div className="min-h-screen bg-green-900 flex items-center justify-center p-4">

        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full">

          <CabecalhoColeta

            nomeOM={coleta?.om?.sigla}

          />

          <div className="mt-6 text-center">

            <p className="text-red-700 font-semibold">

              Nenhuma coleta foi importada.

            </p>

            <p className="mt-2 text-gray-600">

              Importe uma coleta antes de exportar as avaliações.

            </p>

          </div>

        </div>

      </div>

    );

  }

  return (

    <div className="bg-white rounded-3xl shadow-xl p-6 max-w-lg mx-auto">

      <CabecalhoColeta

        siglaOM={coleta.om?.sigla}

        subunidade={

          coleta.subunidade ??

          coleta.su

        }

      />

      <div className="space-y-3 mt-3">

        <h2 className="text-center text-xl font-bold mb-2">

          EXPORTAÇÃO DE AVALIAÇÕES

        </h2>

        <br />

        <div className="space-y-1">

          <p className="text-sm font-semibold text-gray-700">

            Organização Militar:

          </p>

          <p className="text-lg font-bold text-green-700">

            {coleta.om.sigla}

          </p>

        </div>

        <div className="space-y-1">

          <p className="text-sm font-semibold text-gray-700">

            Subunidade:

          </p>

          <p className="text-lg font-bold">

            {coleta.subunidade ?? coleta.su}

          </p>

        </div>

        <div className="space-y-1">

          <p className="text-sm font-semibold text-gray-700">

            TAF:

          </p>

          <p className="text-lg font-bold">

            {coleta.campanha.numeroTAF}º TAF

          </p>

          <p className="text-lg font-bold">

            {coleta.campanha.numeroTAF}º TAF

          </p>

        </div>

        <div className="space-y-1">

          <p className="text-sm font-semibold text-gray-700">

            Chamada:

          </p>

          <p className="text-lg font-bold">

            {coleta.campanha.numeroChamada}ª Chamada

          </p>

        </div>

        <br />

        <div className="space-y-1">

          <div className="flex items-center justify-between">

            <p className="text-sm font-semibold text-gray-700">

              Avaliações armazenadas:

            </p>

            <button

              type="button"

              disabled

              title="Comprovante disponível após a importação no CalcTAF Web"

              className="opacity-40 cursor-not-allowed"

            >

              <img

                src={pdfIcon}

                alt="PDF"

                className="w-7 h-auto"

              />

            </button>

          </div>

          <br />

          <p className="text-2xl font-bold text-center text-green-700">

            {avaliacoes.length}

          </p>

        </div>

        <br />

        <button

          type="button"

          onClick={exportarColeta}

          disabled={avaliacoes.length === 0}

          className={`

            w-full

            rounded-xl

            py-3

            text-white

            font-bold

            transition-colors

            ${

              avaliacoes.length === 0

                ? "bg-gray-400 cursor-not-allowed"

                : "bg-green-700 hover:bg-green-800"

            }

          `}

        >

          📤 EXPORTAR AVALIAÇÕES

        </button>

      </div>

    </div>

  );

}