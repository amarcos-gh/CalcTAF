import { useEffect, useState } from "react";

import * as XLSX from "xlsx";

import api from "../../services/api";

export default function Militares() {

  const [militares, setMilitares] = useState([]);

  const [manterPG, setManterPG] = useState(false);

  const [manterSegmento, setManterSegmento] = useState(false);

  const [manterCurso, setManterCurso] = useState(false);

  const [manterSubunidade, setManterSubunidade] = useState(false);

  const [subunidadeInput, setSubunidadeInput] = useState("");

  const [busca, setBusca] = useState("");

  const [militarSelecionado, setMilitarSelecionado] = useState(null);

  const [mensagem, setMensagem] = useState("");

  const [cursos, setCursos] = useState([
    {
      id: 1,
      codigo: "LEMB"
    },

    {
      id: 2,
      codigo: "LEMS/LEMC/LEMCT"
    }
  ]);

  const [subunidades, setSubunidades] = useState([]);

  const [form, setForm] = useState({

    nomeCompleto: "",

    nomeGuerra: "",

    postoGraduacaoId: "",

    segmento: "",

    cursoId: "",

    dataNascimento: "",

    subunidade: ""
  });

  const [abaAtiva, setAbaAtiva] = useState("cadastro");

  const postosGraduacoes = [

    { id: 1, sigla: "Cel" },

    { id: 2, sigla: "TC" },

    { id: 3, sigla: "Maj" },

    { id: 4, sigla: "Cap" },

    { id: 5, sigla: "1º Ten" },

    { id: 6, sigla: "2º Ten" },

    { id: 7, sigla: "Asp Of" },

    { id: 8, sigla: "ST" },

    { id: 9, sigla: "1º Sgt" },

    { id: 10, sigla: "2º Sgt" },

    { id: 11, sigla: "3º Sgt" },

    { id: 12, sigla: "Cb" },

    { id: 13, sigla: "Sd EP" },

    { id: 14, sigla: "Sd EV" }
  ];

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

      setMilitares(response.data);

    } catch (error) {

      console.error("=== ERRO MILITARES ===");

      console.error("Status:", error.response?.status);

      console.error("Mensagem:", error.response?.data);

      console.error(error);

    }

  }

  useEffect(() => {

    carregarMilitares();

    carregarSubunidades();

  }, []);

  useEffect(() => {

    return () => {

      setManterSubunidade(false);

    };

  }, []);

  async function carregarSubunidades() {

    try {

      const response = await api.get(

        "/subunidades",

        {

          params: {

            omId: localStorage.getItem("omId")

          }

        }

      );

      setSubunidades(response.data);

    } catch (error) {

      console.error("=== ERRO SUBUNIDADES ===");

      console.error("Status:", error.response?.status);

      console.error("Mensagem:", error.response?.data);

      console.error(error);

    }

  }
  
  async function cadastrarMilitar(e) {

    e.preventDefault();

    try {

      const militarDuplicado =
        militares.find((militar) => {

          return (
            militar.nomeCompleto
              .toLowerCase()
              .trim() ===
            form.nomeCompleto
              .toLowerCase()
              .trim()
          );
        });

        if (

          militarDuplicado

          &&

          militarDuplicado.id !==
            militarSelecionado?.id

        ) {

          setMensagem(

            "Já existe um militar com este Nome Completo."

          );

          return;

        }

      if (

          militarSelecionado?.id

          &&

          militarSelecionado.nomeCompleto
            .trim()
            .toUpperCase()

            ===

          form.nomeCompleto
            .trim()
            .toUpperCase()

        ) {

        const confirmar =
          window.confirm(

            "Deseja atualizar o cadastro deste militar?"
          );

        if (!confirmar) {

          return;
        }

        try {

          const response =
            await api.put(

              `/militares/${militarSelecionado.id}`,

              {

                nomeCompleto:

                  form.nomeCompleto ||

                  militarSelecionado.nomeCompleto,

                postoGraduacaoId:

                  form.postoGraduacaoId

                    ?

                    Number(
                      form.postoGraduacaoId
                    )

                    :

                    militarSelecionado.postoGraduacao?.id,

                nomeGuerra:

                  form.nomeGuerra ||

                  militarSelecionado.nomeGuerra,

                segmento:

                  form.segmento ||

                  militarSelecionado.segmento,

                cursoId:

                  Number(
                    form.cursoId
                  ) ||

                  militarSelecionado.cursoId,

                dataNascimento:

                  form.dataNascimento ||

                  militarSelecionado.dataNascimento,

                subunidade:
                  subunidadeInput.trim()
                }
            );

          setMilitarSelecionado({
            ...response.data
          });

          await carregarMilitares();

          setBusca("");

          setMensagem(
            "Cadastro atualizado com sucesso."
          );

          return;

        } catch (error) {

          console.error(error);

          setMensagem(
            "Erro ao atualizar cadastro."
          );

          return;
        }
      }
      
      setMilitarSelecionado(
        null
      );

      const response =
        await api.post("/militares", {

          nomeCompleto:
            form.nomeCompleto,

          postoGraduacaoId:
            Number(
              form.postoGraduacaoId
            ),

          nomeGuerra:
            form.nomeGuerra,

          segmento:
            form.segmento,

          cursoId:
            Number(form.cursoId),

          dataNascimento:
            form.dataNascimento,

          subunidade:
            subunidadeInput,

          omId:
            Number(
              localStorage.getItem(
                "omId"
              )
            )
        });

      setMensagem(
        "Militar cadastrado com sucesso."
      );

      setMilitarSelecionado(
        response.data
      );

      await carregarMilitares();

      setForm({

        nomeCompleto: "",

        postoGraduacaoId:

          manterPG

            ?

            form.postoGraduacaoId

            :

            "",

        nomeGuerra: "",

        segmento:

          manterSegmento

            ?

            form.segmento

            :

            "",

        cursoId:

          manterCurso

            ?

            form.cursoId

            :

            "",

        dataNascimento: "",

        subunidade:

          manterSubunidade

            ?

            subunidadeInput

            :

            ""
      });

      if (!manterSubunidade) {

        setSubunidadeInput("");
      }

      setBusca("");

      return;

      //carregarMilitares();

    } catch (error) {

      console.error(
        "ERRO FRONTEND:",
        error
      );

      console.error(
        "ERRO BACKEND:",
        error.response?.data
      );

      setMensagem(

        error.response?.data?.error ||

        error.message ||

        "Erro ao cadastrar militar."
      );
    }
  }

  function formatarDataBR(valor) {

    valor =
      valor.replace(/\D/g, "");

    valor =
      valor.replace(
        /(\d{2})(\d)/,
        "$1/$2"
      );

    valor =
      valor.replace(
        /(\d{2})(\d)/,
        "$1/$2"
      );

    return valor;
  }

  function baixarModeloPlanilha() {

    const workbook = XLSX.utils.book_new();

    /* ABA INSTRUÇÕES */

    const instrucoes = [

      ["MODELO DE IMPORTAÇÃO DE MILITARES"],

      [""],

      ["INSTRUÇÕES"],

      ["1. Não altere os nomes das colunas da aba Militares."],

      ["2. Não exclua colunas."],

      ["3. Preencha uma linha para cada militar."],

      ["4. Nome Completo é obrigatório."],

      ["5. PG deve conter a sigla (Ex.: Cel, Cap, ST, 3º Sgt, Sd EP...)."],

      ["6. Segmento deve ser M ou F."],

      ["7. Curso deve ser LEMB ou LEMS/LEMC/LEMCT."],

      ["8. Data de Nascimento no formato DD/MM/AAAA."],

      ["9. Subunidade deve ser exatamente como utilizada na OM."],

      ["10. Militares existentes serão atualizados pelo Nome Completo."],

      ["11. Novos militares serão cadastrados automaticamente."],

      ["12. Linhas com erro aparecerão na lista de inconsistências."]

    ];

    const wsInstrucoes =

      XLSX.utils.aoa_to_sheet(instrucoes);

    XLSX.utils.book_append_sheet(

      workbook,

      wsInstrucoes,

      "Instruções"

    );

    /* ABA MILITARES */

    const militares = [[

      "Nome Completo",

      "PG",

      "Nome Guerra",

      "Segmento",

      "Curso",

      "Data Nascimento",

      "Subunidade"

    ]];

    const wsMilitares =

      XLSX.utils.aoa_to_sheet(militares);

    XLSX.utils.book_append_sheet(

      workbook,

      wsMilitares,

      "Militares"

    );

    XLSX.writeFile(

      workbook,

      "Modelo_Importacao_Militares.xlsx"

    );

  }

  const militaresFiltrados =
    militares.filter((militar) => {

      if (!busca.trim()) {
        return false;
      }

      const termo =
        busca.toLowerCase();

      return (

        militar.nomeCompleto
          ?.toLowerCase()
          .includes(termo)

        ||

        militar.nomeGuerra
          ?.toLowerCase()
          .includes(termo)
      );
    });

async function excluirMilitar() {

  if (!militarSelecionado) {

    alert("Selecione um militar para excluir.");

    return;

  }

  if (

    !window.confirm(

      "Confirma a exclusão do militar?"

    )

  ) {

    return;

  }

  try {

    await api.delete(

      `/militares/${militarSelecionado.id}`

    );

    setMensagem(

      "Militar excluído com sucesso!"

    );

    setMilitarSelecionado(null);

    setForm({

      ...form,

      nomeCompleto: "",

      nomeGuerra: "",

      dataNascimento: ""

    });

    carregarMilitares();

  } catch (error) {

    console.error(error);

    alert(

      error.response?.data?.error ||

      error.message ||

      "Erro ao excluir militar."

    );

  }

}

  return (

    <div className="space-y-6">

      {/* ABAS */}

      <div className="bg-white rounded-2xl shadow-lg p-3">

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() => setAbaAtiva("cadastro")}
            className={`
              px-6
              py-3
              rounded-xl
              font-semibold
              transition-all
              ${
                abaAtiva === "cadastro"
                  ? "bg-green-700 text-white"
                  : "bg-slate-200 text-black hover:bg-slate-300"
              }
            `}
          >
            Cadastro
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva("importacao")}
            className={`
              px-6
              py-3
              rounded-xl
              font-semibold
              transition-all
              ${
                abaAtiva === "importacao"
                  ? "bg-green-700 text-white"
                  : "bg-slate-200 text-black hover:bg-slate-300"
              }
            `}
          >
            Importar Dados
          </button>

        </div>

      </div>

      {/* ABA CADASTRO */}

      {abaAtiva === "cadastro" && (

        <div className="bg-white rounded-2xl shadow-lg p-6">

          {mensagem && (

            <div
              className="
                mb-4
                px-4
                py-3
                rounded-xl
                bg-slate-100
              "
            >

              {mensagem}

            </div>

          )}

          <form
            onSubmit={cadastrarMilitar}
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >

          {/* NOME COMPLETO */}

          <div className="relative">

            <input
              type="text"
              placeholder="Nome Completo"
              value={form.nomeCompleto}
              onChange={(e) => {

                setForm({

                  ...form,

                  nomeCompleto:
                    e.target.value.toUpperCase()
                });

                setBusca(
                  e.target.value
                );
              }}
              className="
                border
                rounded-xl
                p-3
                w-full
              "
              required={!militarSelecionado}
            />

            {busca.trim() &&
              militaresFiltrados.length > 0 && (

                <div
                  className="
                    absolute
                    top-full
                    left-0
                    right-0
                    bg-white
                    border
                    rounded-xl
                    shadow-xl
                    z-[9999]
                    mt-1
                    max-h-60
                    overflow-y-auto
                  "
                >

                {militaresFiltrados.map(
                  (militar) => (

                    <button
                      key={militar.id}
                      type="button"
                      onClick={() => {

                      setMilitarSelecionado(
                        militar
                      );

                      const nomeSU =
                        militar.subunidade?.nome ?? "";

                      setSubunidadeInput(nomeSU);

                      setBusca("");

                      setForm({

                        id: militar.id,

                        nomeCompleto: militar.nomeCompleto ?? "",

                        nomeGuerra: militar.nomeGuerra ?? "",

                        postoGraduacaoId:
                          militar.postoGraduacaoId ?? "",

                        segmento:
                          militar.segmento ?? "",

                        cursoId:
                          militar.cursoId ?? "",

                        dataNascimento:
                          militar.dataNascimento
                            ? new Date(
                                militar.dataNascimento
                              )
                                .toISOString()
                                .slice(0,10)
                                .split("-")
                                .reverse()
                                .join("/")
                            : "",

                        subunidade: nomeSU
                      });
                    }}
          className="
            w-full
            text-left
            p-3
            hover:bg-slate-100
            border-b
          "
          >

            <div className="font-bold">

              {militar.nomeGuerra}

            </div>

            <div className="text-sm text-slate-500">

              {militar.nomeCompleto}

            </div>

          </button>
          )
          )}

          </div>
          )}

          </div>

      {/* POSTO/GRADUAÇÃO + NOME DE GUERRA */}
      <div className="flex flex-col">

        <div className="flex gap-3 items-start">

          <select

            value={form.postoGraduacaoId || ""}

            onChange={(e) =>

              setForm({

                ...form,

                postoGraduacaoId:
                  e.target.value
              })
            }

            className="
              border
              rounded-xl
              p-3
              w-40
              flex-shrink-0
            "

            required={!militarSelecionado}
          >

            <option value="">

              Posto/Grad.

            </option>

            {postosGraduacoes.map(

            (posto) => (

              <option

                key={posto.id}

                value={posto.id}

              >

                {posto.sigla}

              </option>
            )
          )}

          </select>

          <input

            type="text"

            placeholder="Nome de Guerra"

            value={form.nomeGuerra}

            onChange={(e) =>

              setForm({

                ...form,

                nomeGuerra:
                  e.target.value.toUpperCase()
              })
            }

            className="
              border
              rounded-xl
              p-3
              flex-1
            "

            required={!militarSelecionado}
          />

        </div>

        <label

          className="
            mt-1
            flex
            items-center
            gap-2
            text-sm
          "

        >

          <input

            type="checkbox"

            checked={

              manterPG

            }

            onChange={(e) =>

              setManterPG(

                e.target.checked
              )
            }
          />

          Manter P/G para cadastro

        </label>

      </div>

      {/* SEGMENTO */}
      <div className="flex flex-col">

        <select
          value={form.segmento}
          onChange={(e) =>
            setForm({

              ...form,

              segmento:
                e.target.value
            })
          }
          className="
            border
            rounded-xl
            p-3
          "
        >

          <option value="">
            Segmento
          </option>

          <option value="M">
            MASCULINO
          </option>

          <option value="F">
            FEMININO
          </option>

        </select>

        <label
          className="
            flex 
            items-center 
            gap-2
            text-sm
          "
        >

          <input

            type="checkbox"

            checked={manterSegmento}

            onChange={(e) =>

              setManterSegmento(

                e.target.checked
              )
            }
          />

          manter Segmento para cadastro

        </label>
      </div>

      {/* CURSO */}
      <div className="flex flex-col">

      <select
        value={form.cursoId || ""}
        onChange={(e)=>
          setForm({
            ...form,
            cursoId:e.target.value
          })
        }
        className="
          border
          rounded-xl
          p-3
        "
      >

      <option value="">
      Curso
      </option>

      {cursos.map((curso)=>(
        <option
          key={curso.id}
          value={curso.id}
        >
          {curso.codigo}
        </option>
      ))}

      </select>

      <label
         className="
           flex 
           items-center 
           gap-2
           text-sm
         "
       >

        <input

          type="checkbox"

          checked={manterCurso}

          onChange={(e) =>

            setManterCurso(

              e.target.checked
            )
          }
        />

        manter Curso para cadastro

      </label>
      </div>

      {/* DATA NASCIMENTO */}

      <input
        type="text"
        placeholder="Data de Nascimento"
        value={form.dataNascimento}
        onChange={(e) =>
          setForm({

            ...form,

            dataNascimento:
              formatarDataBR(
                e.target.value
              )
          })
        }
        className="
          border
          rounded-xl
          p-3
        "
        maxLength={10}
        required={!militarSelecionado}
      />

      {/* SUBUNIDADE */}
      <div className="space-y-2">

        <input
          type="text"

          placeholder="Subunidade"

          value={subunidadeInput}

          onChange={(e) => {

            let valor = e.target.value.toUpperCase();

            valor = valor.replace(

              /[^a-zA-ZÀ-ÿ0-9\s\-]/g,

              ""
            );

            valor = valor.replace(
              /\s{2,}/g,
              " "
            );

            setSubunidadeInput(
              valor
            );

            setForm({

              ...form,

              subunidade:
                valor
            });
          }}

          className="
            border
            rounded-xl
            p-3
            w-full
          "

          required={!militarSelecionado}
        />

        <label
          className="
            flex
            items-center
            gap-2
            text-sm
          "
        >

          <input
            type="checkbox"

            checked={
              manterSubunidade
            }

            onChange={(e) =>

              setManterSubunidade(
                e.target.checked
              )
            }
          />

          manter Subunidade para cadastro

        </label>

      </div>

      {/* BOTÃO */}

      <div className="col-span-2 grid grid-cols-[85%_14%] gap-3 mt-4">

        <button

          type="submit"

          className="
            bg-green-800
            hover:bg-green-700
            text-white
            font-semibold
            rounded-xl
            py-3
            w-full
          "
        >

          Cadastrar Militar

        </button>

        <button

          type="button"

          onClick={excluirMilitar}

          className="
            bg-red-600
            hover:bg-red-500
            text-white
            font-semibold
            rounded-xl
            py-3
            w-full
          "
        >

          Excluir

        </button>

      </div>

      </form>

      </div>

      )}

            {/* ABA IMPORTAR DADOS */}

      {abaAtiva === "importacao" && (

        <div className="space-y-6">

          {/* CARD IMPORTAÇÃO */}

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <div className="space-y-6">

              <div>

                <label className="block font-medium mb-2">

                  Arquivo da Planilha

                </label>

                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="
                    w-full
                    border
                    rounded-xl
                    p-3
                  "
                />

              </div>

              <div className="flex gap-3 flex-wrap">

                <button
                  type="button"
                  onClick={baixarModeloPlanilha}
                  className="
                    bg-slate-200
                    hover:bg-slate-300
                    rounded-xl
                    px-5
                    py-3
                  "
                >
                  📄 Baixar Modelo de Planilha
                </button>

                <button
                  type="button"
                  className="
                    bg-green-700
                    hover:bg-green-600
                    text-white
                    rounded-xl
                    px-8
                    py-3
                    font-semibold
                  "
                >
                  IMPORTAR
                </button>

              </div>

            </div>

          </div>

          {/* RESULTADO */}

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h3 className="text-lg font-semibold mb-4">

              Resultado da Importação

            </h3>

            <div className="space-y-2">

              <div className="flex justify-between">

                <span>Novos militares</span>

                <strong>0</strong>

              </div>

              <div className="flex justify-between">

                <span>Militares atualizados</span>

                <strong>0</strong>

              </div>

              <div className="flex justify-between">

                <span>Inconsistências</span>

                <strong>0</strong>

              </div>

            </div>

          </div>

          {/* INCONSISTÊNCIAS */}

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h3 className="text-lg font-semibold mb-4">

              Inconsistências

            </h3>

            <div
              className="
                border
                rounded-xl
                p-4
                text-slate-500
              "
            >

              Nenhuma inconsistência encontrada.

            </div>

          </div>

        </div>

      )}

    </div>

  );

}