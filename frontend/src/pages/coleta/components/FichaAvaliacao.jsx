import { useState, useEffect } from "react";

import {
  salvarAvaliacao,
  obterColeta
} from "../../../database/indexedDB";

import {
  MENCOES,
  processarAvaliacao
} from "../../../services/calculoTAF";

export default function FichaAvaliacao({
  militar,
  onVoltar,
  onSalvou
}) {

  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [mostrarConfirmacao, setMostrarConfirmacao] =
    useState(false);

  const [resultado, setResultado] =
    useState(null);

  const idade = (() => {

    const hoje = new Date();

    const nascimento = new Date(
      militar.dataNascimento
    );

    let idade =
      hoje.getFullYear() -
      nascimento.getFullYear();

    const mes =
      hoje.getMonth() -
      nascimento.getMonth();

    if (
      mes < 0 ||
      (
        mes === 0 &&
        hoje.getDate() <
          nascimento.getDate()
      )
    ) {
      idade--;
    }

    return idade;

  })();

  const cursoCodigo =
    militar.curso?.codigo ?? "";

  const cursoEspecial =
    ["LEMS", "LEMC", "LEMCT"]
      .includes(cursoCodigo);

  const aplicaBarra =
    !cursoEspecial &&
    idade < 50;

  const aplicaPPM =
    !cursoEspecial &&
    idade < 40;

  const [form, setForm] = useState({

    corrida: "",

    flexao: "",

    abdominal: "",

    barra: "",

    ppm: ""

  });

  useEffect(() => {

    async function calcular() {

      try {

        const retorno =
          await processarAvaliacao({

            segmento:
              militar.segmento,

            curso:
              cursoCodigo,

            idade,

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
              aplicaBarra
                ? (
                    form.barra === ""
                      ? null
                      : Number(form.barra)
                  )
                : null,

            ppm:
              aplicaPPM
                ? (form.ppm || null)
                : null

          });

        setResultado(retorno);

      }

      catch (erro) {

        console.error(erro);

        setResultado(null);

      }

    }

    calcular();

  }, [

    form,

    idade,

    cursoCodigo,

    militar.segmento,

    aplicaBarra,

    aplicaPPM

  ]);

  function alterarCampo(
    campo,
    valor
  ) {

    setForm((anterior) => ({

      ...anterior,

      [campo]: valor

    }));

  }

  function abrirConfirmacao() {

    if (!resultado) {

      setMensagem(
        "Não foi possível calcular a avaliação."
      );

      return;

    }

    setMostrarConfirmacao(true);

  }

    async function confirmarSalvar() {

    try {

      setSalvando(true);
      setMensagem("");

      const coleta = await obterColeta();

      await salvarAvaliacao({

        militarId: militar.id,

        campanha: coleta.campanha,

        om: coleta.om,

        segmento: militar.segmento,

        curso: cursoCodigo,

        idade,

        ...resultado

      });

      setMostrarConfirmacao(false);

      setMensagem(
        "Avaliação salva com sucesso."
      );

      setTimeout(() => {

        onSalvou();

      }, 700);

    }

    catch (erro) {

      console.error(erro);

      setMensagem(
        "Erro ao salvar avaliação."
      );

    }

    finally {

      setSalvando(false);

    }

  }

  function cancelarSalvar() {

    setMostrarConfirmacao(false);

  }

  const mencaoCorrida =
    resultado?.mencaoCorrida ??
    MENCOES.NR;

  const mencaoFlexao =
    resultado?.mencaoFlexao ??
    MENCOES.NR;

  const mencaoAbdominal =
    resultado?.mencaoAbdominal ??
    MENCOES.NR;

  const mencaoBarra =
    resultado?.mencaoBarra ??
    MENCOES.NF;

  const mencaoPPM =
    resultado?.mencaoPPM ??
    MENCOES.NF;

  const mencaoFinal =
    resultado?.mencaoFinal ??
    MENCOES.NR;

  function corMencao(mencao) {

    switch (mencao) {

      case MENCOES.I:
        return "text-red-700";

      case MENCOES.R:
        return "text-orange-600";

      case MENCOES.B:
        return "text-blue-700";

      case MENCOES.MB:
        return "text-green-700";

      case MENCOES.E:
        return "text-purple-700";

      case MENCOES.A:
        return "text-green-700";

      case MENCOES.NA:
        return "text-red-700";

      case MENCOES.NF:
        return "text-gray-500";

      default:
        return "text-gray-500";

    }

  }

  function LinhaMencao({

    titulo,

    valor

  }) {

    return (

      <div className="flex justify-between border-b py-2">

        <span className="font-medium">

          {titulo}

        </span>

        <span
          className={`font-bold ${corMencao(valor)}`}
        >

          {valor}

        </span>

      </div>

    );

  }

  return (

  <>
    <div>

      <h2 className="text-2xl font-bold mb-6">

        {militar.postoGraduacao.abreviacao?.replace("§", "º")}{" "}

        {militar.nomeGuerra}

      </h2>

      <div className="space-y-2">

        <p>

          <strong>Idade:</strong> {idade} anos

        </p>

        <p>

          <strong>Curso:</strong> {cursoCodigo}

        </p>

        <p>

          <strong>Segmento:</strong>{" "}

          {militar.segmento === "M"

            ? "Masculino"

            : "Feminino"}

        </p>

        <hr className="my-5" />

        <h3 className="text-xl font-bold mb-4">

          Lançamento dos Índices

        </h3>

        <div className="grid grid-cols-2 gap-4">

          <div>

            <label className="font-semibold">

              Corrida

            </label>

            <input

              type="number"

              value={form.corrida}

              onChange={(e) =>

                alterarCampo(

                  "corrida",

                  e.target.value

                )

              }

              className="border rounded-lg w-full px-3 py-2 text-center"

            />

            <p className={`text-center font-bold mt-1 ${corMencao(mencaoCorrida)}`}>

              {mencaoCorrida}

            </p>

          </div>

          <div>

            <label className="font-semibold">

              Flexão

            </label>

            <input

              type="number"

              value={form.flexao}

              onChange={(e) =>

                alterarCampo(

                  "flexao",

                  e.target.value

                )

              }

              className="border rounded-lg w-full px-3 py-2 text-center"

            />

            <p className={`text-center font-bold mt-1 ${corMencao(mencaoFlexao)}`}>

              {mencaoFlexao}

            </p>

          </div>

          <div>

            <label className="font-semibold">

              Abdominal

            </label>

            <input

              type="number"

              value={form.abdominal}

              onChange={(e) =>

                alterarCampo(

                  "abdominal",

                  e.target.value

                )

              }

              className="border rounded-lg w-full px-3 py-2 text-center"

            />

            <p className={`text-center font-bold mt-1 ${corMencao(mencaoAbdominal)}`}>

              {mencaoAbdominal}

            </p>

          </div>

          {

            aplicaBarra && (

              <div>

                <label className="font-semibold">

                  Barra

                </label>

                <input

                  type="number"

                  value={form.barra}

                  onChange={(e) =>

                    alterarCampo(

                      "barra",

                      e.target.value

                    )

                  }

                  className="border rounded-lg w-full px-3 py-2 text-center"

                />

                <p className={`text-center font-bold mt-1 ${corMencao(mencaoBarra)}`}>

                  {mencaoBarra}

                </p>

              </div>

            )

          }

          {

            aplicaPPM && (

              <div>

                <label className="font-semibold">

                  PPM

                </label>

                <select

                  value={form.ppm}

                  onChange={(e) =>

                    alterarCampo(

                      "ppm",

                      e.target.value

                    )

                  }

                  className="border rounded-lg w-full px-3 py-2"

                >

                  <option value="">

                    Selecione

                  </option>

                  <option value="A">

                    A

                  </option>

                  <option value="NA">

                    NA

                  </option>

                </select>

                <p className={`text-center font-bold mt-1 ${corMencao(mencaoPPM)}`}>

                  {mencaoPPM}

                </p>

              </div>

            )

          }

        </div>

        <div className="mt-8 text-center">

          <span className="text-lg font-semibold">

            Menção Final

          </span>

          <div className={`text-4xl font-extrabold mt-2 ${corMencao(mencaoFinal)}`}>

            {mencaoFinal}

          </div>

        </div>

        {

          mensagem && (

            <p

              className={`mt-6 text-center font-semibold ${

                mensagem ===

                "Avaliação salva com sucesso."

                  ? "text-green-700"

                  : "text-red-600"

              }`}

            >

              {mensagem}

            </p>

          )

        }

        <div className="mt-8 grid grid-cols-2 gap-3">

          <button

            type="button"

            onClick={onVoltar}

            disabled={salvando}

            className="bg-gray-300 hover:bg-gray-400 rounded-lg py-3 font-semibold"

          >

            Voltar

          </button>

          <button

            type="button"

            onClick={abrirConfirmacao}

            disabled={salvando}

            className="bg-green-700 hover:bg-green-800 text-white rounded-lg py-3 font-semibold"

          >

            Salvar

          </button>

        </div>

      </div>

    </div>

    {

      mostrarConfirmacao && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-xl p-6 w-[92%] max-w-md">

            <h2 className="text-xl font-bold mb-5 text-center">

              Confirmar Avaliação

            </h2>

            <LinhaMencao

              titulo="Corrida"

              valor={mencaoCorrida}

            />

            <LinhaMencao

              titulo="Flexão"

              valor={mencaoFlexao}

            />

            <LinhaMencao

              titulo="Abdominal"

              valor={mencaoAbdominal}

            />

            {

              aplicaBarra && (

                <LinhaMencao

                  titulo="Barra"

                  valor={mencaoBarra}

                />

              )

            }

            {

              aplicaPPM && (

                <LinhaMencao

                  titulo="PPM"

                  valor={mencaoPPM}

                />

              )

            }

            <div className="border-t mt-4 pt-4 flex justify-between">

              <strong>

                Menção Final

              </strong>

              <strong className={corMencao(mencaoFinal)}>

                {mencaoFinal}

              </strong>

            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">

              <button

                onClick={cancelarSalvar}

                className="bg-gray-300 hover:bg-gray-400 rounded-lg py-3 font-semibold"

              >

                Não

              </button>

              <button

                onClick={confirmarSalvar}

                className="bg-green-700 hover:bg-green-800 text-white rounded-lg py-3 font-semibold"

              >

                Sim

              </button>

            </div>

          </div>

        </div>

      )

    }

  </>

);
}